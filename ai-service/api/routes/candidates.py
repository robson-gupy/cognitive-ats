"""
Rotas para funcionalidades relacionadas a candidatos
"""
import logging
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
    logger.info(f"📋 Provider solicitado: {request.provider or 'padrão'}")
    logger.info(f"🤖 Modelo solicitado: {request.model or 'padrão'}")
    logger.info(f"👤 Candidato: {request.resume.personal_info.get('name', 'N/A') if request.resume.personal_info else 'N/A'}")
    logger.info(f"💼 Vaga: {request.job.title}")
    logger.info(f"❓ Respostas de perguntas: {len(request.question_responses) if request.question_responses else 0}")
    
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        logger.info(f"🔧 Usando provider: {provider_name}")
        
        # Cria o serviço com API key opcional
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Converte os dados para dict
        resume_dict = request.resume.model_dump()
        job_dict = request.job.model_dump()
        question_responses = None
        if request.question_responses:
            question_responses = [qr.model_dump() for qr in request.question_responses]
        
        # Define modelo padrão baseado no provider
        default_model = "gpt-3.5-turbo" if provider_name == "openai" else "claude-3-sonnet-20240229"
        model = request.model or default_model
        
        logger.info(f"🤖 Usando modelo: {model}")
        
        # Avalia o candidato
        logger.info("🚀 Iniciando avaliação com AI Service...")
        scores = await ai_service.evaluate_candidate(
            resume_data=resume_dict,
            job_data=job_dict,
            question_responses=question_responses,
            model=model,
            max_tokens=2000,
            temperature=0.3
        )
        
        logger.info("✅ Avaliação concluída com sucesso")
        logger.info(f"📊 Scores finais:")
        logger.info(f"   - Geral: {scores['overall_score']}/100")
        logger.info(f"   - Respostas: {scores['question_responses_score']}/100")
        logger.info(f"   - Formação: {scores['education_score']}/100")
        logger.info(f"   - Experiência: {scores['experience_score']}/100")
        
        response = CandidateEvaluationResponse(
            overall_score=scores['overall_score'],
            question_responses_score=scores['question_responses_score'],
            education_score=scores['education_score'],
            experience_score=scores['experience_score'],
            provider=provider_name,
            model=model,
            evaluation_details=scores
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
