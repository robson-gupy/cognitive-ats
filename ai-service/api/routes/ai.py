"""
Rotas para funcionalidades de IA
"""
import logging
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from shared.config import AIProvider, Config
from shared.exceptions import AIProviderError, ProviderNotSupportedError, ProviderNotConfiguredError
from core.ai.service import AIService
from api.models.ai import (
    TextGenerationRequest, ChatRequest, EmbeddingRequest,
    ProviderInfoResponse, AIResponse, EmbeddingResponse,
    CandidateEvaluationRequest, CandidateEvaluationResponse
)

# Configurar logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate-text", response_model=AIResponse)
async def generate_text(request: TextGenerationRequest):
    """Gera texto usando o provider configurado"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Gera o texto
        text = await ai_service.generate_text(
            request.prompt,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return AIResponse(
            text=text,
            provider=provider_name,
            model=request.model
        )
        
    except (ProviderNotSupportedError, ProviderNotConfiguredError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=AIResponse)
async def chat(request: ChatRequest):
    """Gera resposta de chat usando o provider configurado"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Gera a resposta de chat
        response = await ai_service.generate_chat(
            request.messages,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return AIResponse(
            text=response,
            provider=provider_name,
            model=request.model
        )
        
    except (ProviderNotSupportedError, ProviderNotConfiguredError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Gera embedding usando o provider configurado"""
    try:
        provider_name = request.provider or Config.DEFAULT_AI_PROVIDER
        provider = AIProvider(provider_name)
        
        # Cria o serviço com API key opcional
        ai_service = AIService(provider, api_key=request.api_key)
        
        # Gera o embedding
        embedding = await ai_service.generate_embedding(request.text)
        
        return EmbeddingResponse(
            embedding=embedding,
            provider=provider_name
        )
        
    except (ProviderNotSupportedError, ProviderNotConfiguredError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/providers")
async def get_providers():
    """Retorna lista de providers disponíveis"""
    providers = [provider.value for provider in AIProvider]
    return {"available_providers": providers}


@router.get("/provider-info", response_model=ProviderInfoResponse)
async def get_provider_info(provider: Optional[str] = None, api_key: Optional[str] = None):
    """Retorna informações sobre um provider específico"""
    try:
        if provider:
            provider_enum = AIProvider(provider)
            ai_service = AIService(provider_enum, api_key=api_key)
            info = ai_service.get_provider_info()
        else:
            # Retorna informações de todos os providers
            info = AIService.get_all_providers_info()
            return ProviderInfoResponse(
                provider="all",
                provider_class="MultipleProviders",
                has_embeddings=True,
                api_key_configured=True,
                available_providers=info["available_providers"]
            )
        
        return ProviderInfoResponse(
            provider=info["provider"],
            provider_class=info["provider_class"],
            has_embeddings=info["has_embeddings"],
            api_key_configured=info["api_key_configured"],
            available_providers=info.get("available_providers", [])
        )
        
    except (ProviderNotSupportedError, ProviderNotConfiguredError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIProviderError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate-candidate", response_model=CandidateEvaluationResponse)
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
