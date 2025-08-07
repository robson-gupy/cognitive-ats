"""
Serviço principal de IA que gerencia diferentes providers
"""
from typing import Dict, Any, Optional, List
from shared.config import AIProvider, Config
from shared.exceptions import AIProviderError
from .factory import AIProviderFactory
from .base import BaseAIProvider


class AIService:
    """Serviço principal para gerenciar diferentes providers de IA"""
    
    def __init__(self, provider: AIProvider, api_key: Optional[str] = None, **kwargs):
        """
        Inicializa o serviço de IA
        
        Args:
            provider: Provider de IA a ser usado
            api_key: API key opcional
            **kwargs: Parâmetros adicionais para o provider
        """
        self.provider = provider
        self.provider_instance = AIProviderFactory.create_provider(provider, api_key, **kwargs)
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """
        Gera texto usando o provider configurado
        
        Args:
            prompt: Prompt para geração
            **kwargs: Parâmetros adicionais
            
        Returns:
            Texto gerado
        """
        return await self.provider_instance.generate_text(prompt, **kwargs)
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Gera resposta de chat usando o provider configurado
        
        Args:
            messages: Lista de mensagens
            **kwargs: Parâmetros adicionais
            
        Returns:
            Resposta gerada
        """
        return await self.provider_instance.generate_chat(messages, **kwargs)
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Gera embedding usando o provider configurado
        
        Args:
            text: Texto para gerar embedding
            
        Returns:
            Lista de floats representando o embedding
        """
        return await self.provider_instance.generate_embedding(text)
    
    def get_provider_info(self) -> Dict[str, Any]:
        """
        Retorna informações sobre o provider atual
        
        Returns:
            Dict com informações do provider
        """
        info = self.provider_instance.get_provider_info()
        info["available_providers"] = AIProviderFactory.get_available_providers()
        return info
    
    @classmethod
    def get_all_providers_info(cls) -> Dict[str, Any]:
        """
        Retorna informações sobre todos os providers disponíveis
        
        Returns:
            Dict com informações de todos os providers
        """
        providers_info = {}
        for provider in AIProvider:
            providers_info[provider.value] = AIProviderFactory.get_provider_info(provider)
        
        return {
            "available_providers": AIProviderFactory.get_available_providers(),
            "providers_info": providers_info
        }
