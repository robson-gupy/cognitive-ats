"""
Modelos Pydantic para requisições de IA
"""
from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class TextGenerationRequest(BaseModel):
    """Modelo para requisição de geração de texto"""
    prompt: str
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7


class ChatRequest(BaseModel):
    """Modelo para requisição de chat"""
    messages: List[Dict[str, str]]
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7


class EmbeddingRequest(BaseModel):
    """Modelo para requisição de embedding"""
    text: str
    provider: Optional[str] = None
    api_key: Optional[str] = None


class ProviderInfoResponse(BaseModel):
    """Modelo para resposta de informações do provider"""
    provider: str
    provider_class: str
    has_embeddings: bool
    api_key_configured: bool
    available_providers: List[str]


class AIResponse(BaseModel):
    """Modelo para resposta de IA"""
    text: str
    provider: str
    model: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None


class EmbeddingResponse(BaseModel):
    """Modelo para resposta de embedding"""
    embedding: List[float]
    provider: str
    model: Optional[str] = None
