from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import os
from enum import Enum


class AIProvider(Enum):
    """Enumeração dos providers de IA suportados"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE = "azure"
    COHERE = "cohere"


class CandidateScoreModel():
    name: str

class BaseAIProvider(ABC):
    """Classe base abstrata para implementar diferentes providers de IA"""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        self.api_key = api_key or self._get_api_key_from_env()
        self.config = kwargs
    
    @abstractmethod
    def _get_api_key_from_env(self) -> str:
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


class OpenAIProvider(BaseAIProvider):
    """Implementação do provider OpenAI"""
    
    def _get_api_key_from_env(self) -> str:
        """Obtém a chave da API OpenAI da variável de ambiente"""
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("API key não encontrada. Configure a variável de ambiente OPENAI_API_KEY ou passe como parâmetro")
        return api_key
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(api_key, **kwargs)
        try:
            import openai
            import httpx
            
            # Configuração específica para evitar problemas de compatibilidade
            # Cria um cliente HTTP customizado sem configurações problemáticas
            http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )
            
            self.client = openai.AsyncOpenAI(
                api_key=self.api_key,
                http_client=http_client
            )
        except ImportError:
            raise ImportError("openai package is required. Install with: pip install openai")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        model = kwargs.get('model', 'gpt-4.1')
        max_tokens = kwargs.get('max_tokens', 1000)
        
        try:
            response = await self.client.responses.create(
                model='gpt-4.1',
                input=prompt
            )
            return response.output_text
        except Exception as e:
            raise Exception(f"Erro ao gerar texto com OpenAI: {str(e)}")
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        model = kwargs.get('model', 'gpt-3.5-turbo')
        max_tokens = kwargs.get('max_tokens', 1000)
        
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Erro ao gerar chat com OpenAI: {str(e)}")
    
    async def generate_embedding(self, text: str) -> List[float]:
        model = self.config.get('embedding_model', 'text-embedding-ada-002')
        
        try:
            response = await self.client.embeddings.create(
                model=model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            raise Exception(f"Erro ao gerar embedding com OpenAI: {str(e)}")

class AIService:
    """Serviço principal de IA configurável"""
    
    def __init__(self, provider: AIProvider, api_key: Optional[str] = None, **kwargs):
        """
        Inicializa o serviço de IA
        
        Args:
            provider: Provider de IA a ser usado
            api_key: Chave da API (opcional - se None, tenta pegar da variável de ambiente)
            **kwargs: Configurações adicionais específicas do provider
        """
        self.provider_enum = provider
        self.provider_instance = self._create_provider(provider, api_key, **kwargs)
    
    def _create_provider(self, provider: AIProvider, api_key: Optional[str] = None, **kwargs) -> BaseAIProvider:
        """Cria a instância do provider específico"""
        provider_map = {
            AIProvider.OPENAI: OpenAIProvider
        }
        
        provider_class = provider_map.get(provider)
        if not provider_class:
            raise ValueError(f"Provider {provider.value} não implementado")
        
        return provider_class(api_key=api_key, **kwargs)
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Gera texto usando o provider configurado"""
        return await self.provider_instance.generate_text(prompt, **kwargs)
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Gera resposta de chat usando o provider configurado"""
        return await self.provider_instance.generate_chat(messages, **kwargs)
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embedding usando o provider configurado"""
        return await self.provider_instance.generate_embedding(text)
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o provider atual"""
        return {
            "provider": self.provider_enum.value,
            "provider_class": self.provider_instance.__class__.__name__,
            "has_embeddings": hasattr(self.provider_instance, 'generate_embedding'),
            "api_key_configured": bool(self.provider_instance.api_key)
        } 