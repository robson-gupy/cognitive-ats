"""
Provider OpenAI para o AI Service
"""
import os
from typing import Dict, Any, Optional, List
from shared.config import Config
from shared.exceptions import TextGenerationError, EmbeddingError
from .base import BaseAIProvider


class OpenAIProvider(BaseAIProvider):
    """Implementação do provider OpenAI"""
    
    def _get_api_key_from_env(self) -> Optional[str]:
        """Obtém a chave da API OpenAI da variável de ambiente"""
        return Config.OPENAI_API_KEY
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(api_key, **kwargs)
        try:
            import openai
            import httpx
            
            # Configuração específica para evitar problemas de compatibilidade
            http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(Config.REQUEST_TIMEOUT),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )
            
            self.client = openai.AsyncOpenAI(
                api_key=self.api_key,
                http_client=http_client
            )
        except ImportError:
            raise ImportError("openai package is required. Install with: pip install openai")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Gera texto usando OpenAI"""
        model = kwargs.get('model', Config.DEFAULT_MODEL)
        max_tokens = kwargs.get('max_tokens', Config.DEFAULT_MAX_TOKENS)
        temperature = kwargs.get('temperature', Config.DEFAULT_TEMPERATURE)
        
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            raise TextGenerationError(f"Erro ao gerar texto com OpenAI: {str(e)}")
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Gera resposta de chat usando OpenAI"""
        model = kwargs.get('model', 'gpt-3.5-turbo')
        max_tokens = kwargs.get('max_tokens', Config.DEFAULT_MAX_TOKENS)
        temperature = kwargs.get('temperature', Config.DEFAULT_TEMPERATURE)
        
        try:
            response = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            raise TextGenerationError(f"Erro ao gerar chat com OpenAI: {str(e)}")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embeddings usando OpenAI"""
        try:
            response = await self.client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            raise EmbeddingError(f"Erro ao gerar embedding com OpenAI: {str(e)}")
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o provider OpenAI"""
        return {
            "provider": "openai",
            "provider_class": "OpenAIProvider",
            "has_embeddings": True,
            "api_key_configured": self.validate_config(),
            "available_models": ["gpt-4", "gpt-3.5-turbo", "gpt-4-turbo"],
            "embedding_model": "text-embedding-ada-002"
        }
