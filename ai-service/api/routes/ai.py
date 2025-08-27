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
    ProviderInfoResponse, AIResponse, EmbeddingResponse
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



