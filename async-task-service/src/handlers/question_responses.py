"""
Handler para processar mensagens de question responses usando IA
"""
import json
import asyncio
import os
from typing import Dict, Any, Optional, List
from datetime import datetime

from config.settings import settings
from models.message import QuestionResponsesMessage
from services.backend_service import BackendService
from utils.logger import ConsumerLogger

logger = ConsumerLogger()

async def handler_question_responses(payload: Dict[str, Any]) -> None:
    """
    Handler para processar mensagens de question responses usando IA

    Formato do payload:
    {
        "eventType": "MULTIPLE_QUESTION_RESPONSES_CREATED",
        "timestamp": "2025-09-23T21:47:59.775Z",
        "data": {
            "totalResponses": 2,
            "responses": [
                {
                    "questionResponseId": "968d352d-e14d-41b0-9d7c-53bb0b27059f",
                    "jobQuestionId": "7506b2f2-a510-4f5e-aad3-6b2a0fba577b",
                    "question": "Descreva uma situação...",
                    "answer": "asdf",
                    "createdAt": "2025-09-23T21:47:59.769Z"
                }
            ],
            "applicationId": "af17fc0a-6d18-422a-b48d-84ba648ab256",
            "jobId": "c964db08-36da-4e87-84d8-dff5cf708f2f",
            "companyId": "12f9c2a1-d01b-492b-a6e9-207507815e5f"
        },
        "job": {
            "id": "c964db08-36da-4e87-84d8-dff5cf708f2f",
            "title": "Auxiliar de Escritório",
            "description": "...",
            "requirements": "..."
        },
        "company": {
            "id": "12f9c2a1-d01b-492b-a6e9-207507815e5f",
            "name": "Gupy",
            "slug": "gupy"
        },
        "application": {
            "id": "af17fc0a-6d18-422a-b48d-84ba648ab256",
            "firstName": "Robson",
            "lastName": "Mendes",
            "email": "dddj33ghgh@dsifjasif.com.br",
            "phone": "11971380503",
            "createdAt": "2025-09-23T21:47:56.456Z"
        }
    }
    """
    logger.info(f"📝 Processando question responses: {payload.get('data', {}).get('applicationId', 'unknown')}")

    try:
        # Extrai dados do payload
        event_type = payload.get("eventType", "MULTIPLE_QUESTION_RESPONSES_CREATED")
        timestamp = payload.get("timestamp")
        data = payload.get("data", {})
        job_data = payload.get("job", {})
        company_data = payload.get("company", {})
        application_data = payload.get("application", {})

        # Validação dos dados obrigatórios
        if not data.get("applicationId"):
            raise ValueError("applicationId é obrigatório")

        if not data.get("responses"):
            raise ValueError("responses é obrigatório")

        if not job_data:
            raise ValueError("job data é obrigatório")

        application_id = data["applicationId"]
        job_id = data.get("jobId")
        company_id = data.get("companyId")
        responses = data["responses"]
        total_responses = data.get("totalResponses", len(responses))

        logger.info(f"🆔 Application ID: {application_id}")
        logger.info(f"💼 Job ID: {job_id}")
        logger.info(f"🏢 Company ID: {company_id}")
        logger.info(f"❓ Total de respostas: {total_responses}")
        logger.info(f"📋 Event Type: {event_type}")

        # Preparar dados para o AI service
        question_responses_for_ai = []
        for response in responses:
            question_responses_for_ai.append({
                "question": response.get("question", ""),
                "answer": response.get("answer", "")
            })

        # Preparar job_data para o AI service
        job_data_for_ai = {
            "title": job_data.get("title", ""),
            "description": job_data.get("description", ""),
            "requirements": _parse_requirements(job_data.get("requirements", "")),
            "responsibilities": [],
            "education_required": "",
            "experience_required": "",
            "skills_required": []
        }

        logger.info(f"🤖 Enviando {len(question_responses_for_ai)} respostas para avaliação no AI service")

        # Chamar o endpoint do AI service para avaliar as respostas
        evaluation_result = await _call_ai_service_for_evaluation(
            question_responses_for_ai,
            job_data_for_ai
        )

        if not evaluation_result:
            raise Exception("Falha ao obter avaliação do AI service")

        # Extrai o score das respostas
        question_responses_score = evaluation_result.get('score', 0)
        evaluation_provider = evaluation_result.get('provider', '')
        evaluation_model = evaluation_result.get('model', '')

        logger.info(f"📊 Score das question responses: {question_responses_score}/100")
        logger.info(f"🔧 Provider usado: {evaluation_provider}")
        logger.info(f"🤖 Modelo usado: {evaluation_model}")

        # Valida se o score é válido
        if not isinstance(question_responses_score, (int, float)) or question_responses_score < 0 or question_responses_score > 100:
            logger.warning(f"⚠️ Score inválido recebido: {question_responses_score}, usando score padrão: 50")
            question_responses_score = 50

        # Log antes de atualizar o banco
        logger.info(f"💾 Atualizando question responses score no banco de dados... application_id={application_id}")

        # Atualiza application com o score via backend service usando endpoint interno
        update_result = await BackendService().update_application_scores(
            application_id=application_id,
            question_responses_score=float(question_responses_score),
            evaluation_provider=evaluation_provider,
            evaluation_model=evaluation_model,
            evaluation_details={
                "question_responses_evaluation": {
                    "total_responses": total_responses,
                    "evaluation_result": evaluation_result,
                    "processed_at": datetime.now().isoformat()
                }
            },
            evaluated_at=datetime.now().isoformat()
        )

        if not update_result.get('success', False):
            raise Exception(f"Falha ao atualizar question responses score: {update_result.get('error', 'Erro desconhecido')}")

        logger.info(f"✅ Question responses score atualizado com sucesso para application {application_id}")
        logger.info(f"📊 Score final: {question_responses_score}/100")

    except Exception as e:
        logger.error(f"❌ Erro ao processar question responses: {str(e)}")
        raise


async def _call_ai_service_for_evaluation(
    question_responses: List[Dict[str, str]],
    job_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Chama o endpoint do AI service para avaliar as question responses

    Args:
        question_responses: Lista de perguntas e respostas
        job_data: Dados da vaga

    Returns:
        Resultado da avaliação do AI service
    """
    import aiohttp

    try:
        # URL do AI service
        ai_service_url = f"{settings.ai_service.url.rstrip('/')}/question-responses/evaluate"

        # Payload para o AI service
        payload = {
            "question_responses": question_responses,
            "job_data": job_data
        }

        logger.info(f"📤 Enviando requisição para AI service: {ai_service_url}")

        async with aiohttp.ClientSession() as session:
            async with session.post(
                ai_service_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=120)  # 2 minutos timeout
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"✅ Avaliação recebida do AI service com sucesso")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Erro do AI service - Status: {response.status}, Erro: {error_text}")
                    return None

    except asyncio.TimeoutError:
        logger.error("⏰ Timeout ao chamar AI service")
        return None
    except Exception as e:
        logger.error(f"💥 Erro ao chamar AI service: {str(e)}")
        return None


def _parse_requirements(requirements_text: str) -> List[str]:
    """
    Converte texto de requirements em lista de strings

    Args:
        requirements_text: Texto dos requisitos

    Returns:
        Lista de requisitos
    """
    if not requirements_text:
        return []

    # Divide por ponto e vírgula, dois pontos, ou quebras de linha
    import re
    requirements = re.split(r'[;:\n]+', requirements_text)

    # Limpa e filtra requisitos vazios
    cleaned_requirements = []
    for req in requirements:
        req = req.strip()
        if req and len(req) > 3:  # Ignora strings muito curtas
            cleaned_requirements.append(req)

    return cleaned_requirements
