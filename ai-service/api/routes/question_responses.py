"""
Rotas para funcionalidades relacionadas a question responses
"""
import logging
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from shared.config import AIProvider, Config
from shared.exceptions import QuestionEvaluationError
from core.ai.service import AIService
from core.question_evaluator.question_evaluator import QuestionEvaluator
from api.models.ai import (
    QuestionEvaluationRequest, 
    QuestionEvaluationResponse
)

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/question-responses", tags=["Question Responses"])


@router.post("/evaluate", response_model=QuestionEvaluationResponse)
async def evaluate_question_responses(request: QuestionEvaluationRequest):
    """Avalia as respostas de perguntas usando IA"""
    logger.info("🎯 Recebida requisição para avaliação de question responses")
    logger.info(f"💼 Vaga: {request.job_data.title}")
    logger.info(f"❓ Número de respostas: {len(request.question_responses)}")
    
    try:
        # Usa variável de ambiente contextualizada para evaluation
        provider_name = os.getenv("EVALUATION_PROVIDER", Config.DEFAULT_AI_PROVIDER)
        provider = AIProvider(provider_name)

        logger.info(f"🔧 Usando provider para avaliação: {provider_name}")

        ai_service = AIService(provider)

        # Usa variável de ambiente contextualizada para evaluation, com fallback para DEFAULT_MODEL
        evaluation_model = os.getenv("EVALUATION_MODEL")
        if evaluation_model:
            model = evaluation_model
        else:
            model = Config.DEFAULT_MODEL

        logger.info(f"🤖 Usando modelo para avaliação: {model}")

        # Criar instância do QuestionEvaluator
        question_evaluator = QuestionEvaluator(ai_service)

        # Converter question_responses para o formato esperado
        question_responses_list = []
        for qr in request.question_responses:
            question_responses_list.append({
                'question': qr.question,
                'answer': qr.answer
            })

        # Converter job_data para o formato esperado
        job_data_dict = {
            'title': request.job_data.title,
            'description': request.job_data.description,
            'requirements': request.job_data.requirements or [],
            'responsibilities': request.job_data.responsibilities or [],
            'education_required': request.job_data.education_required or '',
            'experience_required': request.job_data.experience_required or '',
            'skills_required': request.job_data.skills_required or []
        }

        logger.info(f"📊 Iniciando avaliação de {len(question_responses_list)} respostas")

        # Avaliar as respostas das perguntas
        evaluation_result = await question_evaluator.evaluate_question_responses(
            question_responses=question_responses_list,
            job_data=job_data_dict,
            model=model
        )

        logger.info("✅ Avaliação de question responses concluída com sucesso")
        logger.info(f"📊 Score final: {evaluation_result.get('score', 0)}/100")
        logger.info(f"🔧 Configuração usada: {provider_name} + {model}")

        # Preparar resposta
        response = QuestionEvaluationResponse(
            score=evaluation_result.get('score', 0),
            details=evaluation_result.get('details', {}),
            feedback=evaluation_result.get('feedback', ''),
            improvement_areas=evaluation_result.get('improvement_areas', []),
            evaluated_at=datetime.now().isoformat(),
            provider=provider_name,
            model=model
        )

        logger.info("📤 Enviando resposta para o cliente")
        return response

    except QuestionEvaluationError as e:
        logger.error(f"❌ Erro na avaliação de question responses: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    
    except Exception as e:
        logger.error(f"💥 Erro interno na avaliação de question responses: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/health")
async def health_check():
    """Endpoint de health check para question responses"""
    return {"status": "healthy", "service": "question-responses"}
