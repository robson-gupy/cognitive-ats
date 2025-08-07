"""
Rotas para funcionalidades de IA
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from shared.config import AIProvider, Config
from shared.exceptions import AIProviderError, ProviderNotSupportedError, ProviderNotConfiguredError
from core.ai.service import AIService
from api.models.ai import (
    TextGenerationRequest, ChatRequest, EmbeddingRequest,
    ProviderInfoResponse, AIResponse, EmbeddingResponse
)

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
