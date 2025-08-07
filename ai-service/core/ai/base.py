"""
Classe base para providers de IA
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from shared.config import AIProvider
from shared.exceptions import ProviderNotConfiguredError, APIKeyError


class BaseAIProvider(ABC):
    """Classe base abstrata para implementar diferentes providers de IA"""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        self.api_key = api_key or self._get_api_key_from_env()
        self.config = kwargs
        
        if not self.api_key:
            raise APIKeyError(f"API key não configurada para o provider {self.__class__.__name__}")
    
    @abstractmethod
    def _get_api_key_from_env(self) -> Optional[str]:
        """Obtém a chave da API da variável de ambiente específica do provider"""
        pass
    
    @abstractmethod
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Gera texto usando o provider específico"""
        pass
    
    @abstractmethod
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Gera resposta de chat usando o provider específico"""
        pass
    
    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embeddings usando o provider específico"""
        pass
    
    @abstractmethod
    def get_provider_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o provider"""
        pass
    
    def validate_config(self) -> bool:
        """Valida se o provider está configurado corretamente"""
        return self.api_key is not None and self.api_key.strip() != ""
