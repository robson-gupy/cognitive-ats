"""
Configurações compartilhadas do AI Service
"""
import os
from enum import Enum
from typing import Optional


class AIProvider(Enum):
    """Enumeração dos providers de IA suportados"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE = "azure"
    COHERE = "cohere"


class Config:
    """Configurações centralizadas do serviço"""
    
    # Provider padrão
    DEFAULT_AI_PROVIDER = os.getenv("DEFAULT_AI_PROVIDER", "openai")
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    
    # Configurações de modelo padrão
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4")
    DEFAULT_MAX_TOKENS = int(os.getenv("DEFAULT_MAX_TOKENS", "1000"))
    DEFAULT_TEMPERATURE = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
    
    # Configurações de timeout
    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))
    
    @classmethod
    def get_provider_api_key(cls, provider: AIProvider) -> Optional[str]:
        """Obtém a API key para um provider específico"""
        if provider == AIProvider.OPENAI:
            return cls.OPENAI_API_KEY
        elif provider == AIProvider.ANTHROPIC:
            return cls.ANTHROPIC_API_KEY
        return None
    
    @classmethod
    def validate_provider_config(cls, provider: AIProvider) -> bool:
        """Valida se um provider está configurado corretamente"""
        api_key = cls.get_provider_api_key(provider)
        return api_key is not None and api_key.strip() != ""
