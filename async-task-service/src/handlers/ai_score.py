"""
Handler para processar mensagens de score de candidatos usando IA
"""
import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

from models.message import AIScoreMessage
from models.result import ProcessingResult
from services.backend_service import BackendService
from utils.logger import ConsumerLogger

logger = ConsumerLogger()

async def handler_ai_score(payload: Dict[str, Any]) -> None:
    """
    Handler para processar mensagens de score de candidatos usando IA

    Formato do payload:
    {
        "applicationId": "APP_ID",
        "resumeData": {...},
        "jobData": {...},
        "questionResponses": [...],
        "createdAt": "2025-01-12T18:26:52.877Z"
    }
    """
    logger.info(f"📝 Processando score de candidato: {payload.get('applicationId', 'unknown')}")

    try:
        # Extrai dados do payload
        application_id = payload.get("applicationId")
        resume_data = payload.get("resumeData")
        job_data = payload.get("jobData")
        question_responses = payload.get("questionResponses")
        created_at = payload.get("createdAt")

        if not application_id:
            raise ValueError("applicationId é obrigatório")

        if not resume_data:
            raise ValueError("resumeData é obrigatório")

        if not job_data:
            raise ValueError("jobData é obrigatório")

        logger.info(f"🆔 Application ID: {application_id}")
        logger.info(f"📄 Resume Data: {bool(resume_data)}")
        logger.info(f"💼 Job Data: {bool(job_data)}")
        logger.info(f"❓ Question Responses: {bool(question_responses)}")

        # Cria mensagem de score
        score_message = AIScoreMessage(
            application_id=application_id,
            resume_data=resume_data,
            job_data=job_data,
            question_responses=question_responses,
            created_at=created_at
        )

        # Processa o score
        result = await _process_candidate_score(score_message, "ai-score-handler")

        if result.success:
            logger.info(f"✅ Score processado com sucesso para aplicação: {application_id}")
            logger.info(f"📊 Tempo de processamento: {result.processing_time:.2f} segundos")
            logger.info(f"📈 Scores calculados: {result.result_data}")
        else:
            logger.error(f"❌ Falha no processamento do score: {result.error}")
            raise Exception(f"Erro no processamento: {result.error}")

    except Exception as e:
        logger.error(f"❌ Erro ao processar score {payload.get('applicationId', 'unknown')}: {str(e)}")
        raise


async def _process_candidate_score(
    score_message: AIScoreMessage,
    message_id: str
) -> ProcessingResult:
    """
    Processa o score de um candidato usando IA

    Args:
        score_message: Mensagem com dados para cálculo do score
        message_id: ID da mensagem para logging

    Returns:
        Resultado do processamento
    """
    start_time = datetime.now()
    backend_service = BackendService()

    try:
        logger.info(
            "🚀 Calculando score para candidato",
            application_id=score_message.application_id,
            message_id=message_id
        )

        # Log antes de chamar o serviço de IA
        logger.info(
            "⏳ Aguardando resposta do serviço de IA...",
            application_id=score_message.application_id,
            message_id=message_id
        )

        # Calcula score usando IA via backend service
        evaluation_result = await backend_service.evaluate_candidate(
            application_id=score_message.application_id,
            resume_data=score_message.resume_data,
            job_data=score_message.job_data,
            question_responses=score_message.question_responses
        )

        # Log após receber resposta da IA
        logger.info(
            "✅ Resposta recebida do serviço de IA",
            application_id=score_message.application_id,
            message_id=message_id,
            response_received=bool(evaluation_result)
        )

        if not evaluation_result:
            raise Exception("Falha ao calcular score com IA")

        # Extrai e converte scores para float
        overall_score = _convert_score_to_float(evaluation_result.get('overall_score'))
        education_score = _convert_score_to_float(evaluation_result.get('education_score'))
        experience_score = _convert_score_to_float(evaluation_result.get('experience_score'))
        
        # Extrai provider e model da resposta do AI service
        evaluation_provider = evaluation_result.get('provider')
        evaluation_model = evaluation_result.get('model')

        logger.info(
            "📊 Scores calculados",
            application_id=score_message.application_id,
            overall_score=overall_score,
            education_score=education_score,
            experience_score=experience_score
        )
        
        logger.info(
            "🔧 Configuração de IA usada",
            application_id=score_message.application_id,
            provider=evaluation_provider,
            model=evaluation_model
        )

        # Valida se pelo menos um score válido foi calculado
        if all(score is None for score in [overall_score, education_score, experience_score]):
            raise Exception("Nenhum score válido foi calculado pela IA")

        # Log antes de atualizar o banco
        logger.info(
            f"💾 Atualizando scores no banco de dados... application_id={score_message.application_id} | message_id={message_id}, | job_data={score_message.job_data}",
        )
        
        logger.info(
            f"📤 Enviando provider e model para o backend: {evaluation_provider} + {evaluation_model}",
            application_id=score_message.application_id
        )

        # Atualiza application com os scores via backend service usando endpoint interno
        update_result = await backend_service.update_application_scores(
            application_id=score_message.application_id,
            overall_score=overall_score,
            education_score=education_score,
            experience_score=experience_score,
            evaluation_provider=evaluation_provider,
            evaluation_model=evaluation_model
        )

        if not update_result.get('success', False):
            raise Exception(f"Falha ao atualizar scores: {update_result.get('error', 'Erro desconhecido')}")

        processing_time = (datetime.now() - start_time).total_seconds()

        logger.info(
            "✅ Score processado e atualizado com sucesso",
            application_id=score_message.application_id,
            processing_time=processing_time
        )

        return ProcessingResult(
            success=True,
            application_id=score_message.application_id,
            message_id=message_id,
            timestamp=datetime.now(),
            processing_time=processing_time,
            result_data={
                'overall_score': overall_score,
                'education_score': education_score,
                'experience_score': experience_score
            }
        )

    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(
            f"❌ Erro ao processar score - {str(e)}",
            application_id=score_message.application_id,
            message_id=message_id,
            error=str(e),
            processing_time=processing_time
        )

        return ProcessingResult(
            success=False,
            application_id=score_message.application_id,
            message_id=message_id,
            timestamp=datetime.now(),
            processing_time=processing_time,
            error=str(e)
        )


def _convert_score_to_float(score_value) -> Optional[float]:
    """
    Converte um valor de score para float

    Args:
        score_value: Valor do score (pode ser string, int, float, etc.)

    Returns:
        Score como float ou None se inválido
    """
    if score_value is None:
        return None

    try:
        # Se já for float, retorna como está
        if isinstance(score_value, float):
            return score_value

        # Se for int, converte para float
        if isinstance(score_value, int):
            return float(score_value)

        # Se for string, tenta converter
        if isinstance(score_value, str):
            # Remove caracteres não numéricos e converte
            cleaned = score_value.strip().replace(',', '.')
            return float(cleaned)

        # Para outros tipos, tenta conversão direta
        return float(score_value)

    except (ValueError, TypeError):
        logger.warning(f"⚠️ Não foi possível converter score '{score_value}' para float")
        return None
