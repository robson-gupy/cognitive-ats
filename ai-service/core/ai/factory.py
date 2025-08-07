"""
Factory para criar providers de IA
"""
from typing import Optional, Dict, Any
from shared.config import AIProvider, Config
from shared.exceptions import ProviderNotSupportedError, ProviderNotConfiguredError
from .base import BaseAIProvider
from .openai import OpenAIProvider
from .anthropic import AnthropicProvider


class AIProviderFactory:
    """Factory para criar instâncias de providers de IA"""
    
    _providers = {
        AIProvider.OPENAI: OpenAIProvider,
        AIProvider.ANTHROPIC: AnthropicProvider,
    }
    
    @classmethod
    def create_provider(cls, provider: AIProvider, api_key: Optional[str] = None, **kwargs) -> BaseAIProvider:
        """
        Cria uma instância do provider especificado
        
        Args:
            provider: Provider a ser criado
            api_key: API key opcional (se não fornecida, usa a do ambiente)
            **kwargs: Parâmetros adicionais para o provider
            
        Returns:
            Instância do provider
            
        Raises:
            ProviderNotSupportedError: Se o provider não é suportado
            ProviderNotConfiguredError: Se o provider não está configurado
        """
        if provider not in cls._providers:
            raise ProviderNotSupportedError(f"Provider '{provider.value}' não é suportado")
        
        provider_class = cls._providers[provider]
        
        # Se não foi fornecida API key, verifica se está configurada no ambiente
        if not api_key and not Config.validate_provider_config(provider):
            raise ProviderNotConfiguredError(f"Provider '{provider.value}' não está configurado")
        
        return provider_class(api_key=api_key, **kwargs)
    
    @classmethod
    def get_available_providers(cls) -> list:
        """Retorna lista de providers disponíveis"""
        return [provider.value for provider in cls._providers.keys()]
    
    @classmethod
    def get_provider_info(cls, provider: AIProvider) -> Dict[str, Any]:
        """
        Retorna informações sobre um provider específico
        
        Args:
            provider: Provider para obter informações
            
        Returns:
            Dict com informações do provider
        """
        if provider not in cls._providers:
            return {
                "provider": provider.value,
                "provider_class": "NotSupported",
                "has_embeddings": False,
                "api_key_configured": False,
                "available_models": []
            }
        
        try:
            provider_instance = cls.create_provider(provider)
            return provider_instance.get_provider_info()
        except Exception:
            return {
                "provider": provider.value,
                "provider_class": cls._providers[provider].__name__,
                "has_embeddings": True,
                "api_key_configured": Config.validate_provider_config(provider),
                "available_models": []
            }
