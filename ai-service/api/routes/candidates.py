"""
Rotas para funcionalidades relacionadas a candidatos
"""
import logging
import os
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from shared.config import AIProvider, Config
from shared.exceptions import AIProviderError, ProviderNotSupportedError, ProviderNotConfiguredError
from core.ai.service import AIService
from api.models.ai import (
    CandidateEvaluationRequest, CandidateEvaluationResponse
)

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("/evaluate", response_model=CandidateEvaluationResponse)
async def evaluate_candidate(request: CandidateEvaluationRequest):
    """Avalia a aderência de um candidato a uma vaga"""
    logger.info("🎯 Recebida requisição para avaliação de candidato")
    logger.info(f"👤 Candidato: {request.resume.personal_info.get('name', 'N/A') if request.resume.personal_info else 'N/A'}")
    logger.info(f"💼 Vaga: {request.job.title}")
    logger.info(f"❓ Respostas de perguntas: {len(request.question_responses) if request.question_responses else 0}")
    
    try:
        # Usa variável de ambiente contextualizada para evaluation
        provider_name = os.getenv("EVALUATION_PROVIDER", Config.DEFAULT_AI_PROVIDER)
        provider = AIProvider(provider_name)
        
        logger.info(f"🔧 Usando provider para avaliação: {provider_name}")
        
        # Cria o serviço com API key opcional
        ai_service = AIService(provider)
        
        # Converte os dados para dict
        resume_dict = request.resume.model_dump()
        job_dict = request.job.model_dump()
        question_responses = None
        if request.question_responses:
            question_responses = [qr.model_dump() for qr in request.question_responses]
        
        # Usa variável de ambiente contextualizada para evaluation, com fallback para DEFAULT_MODEL
        evaluation_model = os.getenv("EVALUATION_MODEL")
        if evaluation_model:
            model = evaluation_model
        else:
            model = Config.DEFAULT_MODEL
        
        logger.info(f"🤖 Usando modelo para avaliação: {model}")
        
        # Avalia o candidato
        logger.info("🚀 Iniciando avaliação com AI Service...")
        scores = await ai_service.evaluate_candidate(
            resume_data=resume_dict,
            job_data=job_dict,
            question_responses=question_responses,
            model=model
        )
        
        logger.info("✅ Avaliação concluída com sucesso")
        logger.info(f"📊 Scores finais:")
        logger.info(f"   - Geral: {scores['overall_score']}/100")
        logger.info(f"   - Respostas: {scores['question_responses_score']}/100")
        logger.info(f"   - Formação: {scores['education_score']}/100")
        logger.info(f"   - Experiência: {scores['experience_score']}/100")
        logger.info(f"🔧 Configuração usada: {provider_name} + {model}")
        
        response = CandidateEvaluationResponse(
            overall_score=scores['overall_score'],
            question_responses_score=scores['question_responses_score'],
            education_score=scores['education_score'],
            experience_score=scores['experience_score'],
            provider=provider_name,
            model=model
        )
        
        logger.info("📤 Enviando resposta para o cliente")
        return response
        
    except (ProviderNotSupportedError, ProviderNotConfiguredError) as e:
        logger.error(f"❌ Erro de configuração: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        logger.error(f"❌ Erro do provider de IA: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"❌ Erro inesperado: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")
