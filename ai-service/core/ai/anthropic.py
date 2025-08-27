"""
Provider Anthropic para o AI Service
"""
from typing import Dict, Any, Optional, List
from shared.config import Config
from shared.exceptions import TextGenerationError, EmbeddingError
from .base import BaseAIProvider


class AnthropicProvider(BaseAIProvider):
    """Implementação do provider Anthropic"""
    
    def _get_api_key_from_env(self) -> Optional[str]:
        """Obtém a chave da API Anthropic da variável de ambiente"""
        return Config.ANTHROPIC_API_KEY
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(api_key, **kwargs)
        try:
            import anthropic
            
            self.client = anthropic.AsyncAnthropic(
                api_key=self.api_key
            )
        except ImportError:
            raise ImportError("anthropic package is required. Install with: pip install anthropic")
    
    async def generate_text(self, prompt: str, **kwargs) -> str:
        """Gera texto usando Anthropic"""
        model = kwargs.get('model', 'claude-3-sonnet-20240229')
        
        try:
            response = await self.client.messages.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            raise TextGenerationError(f"Erro ao gerar texto com Anthropic: {str(e)}")
    
    async def generate_chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Gera resposta de chat usando Anthropic"""
        model = kwargs.get('model', 'claude-3-sonnet-20240229')
        
        try:
            response = await self.client.messages.create(
                model=model,
                messages=messages
            )
            return response.content[0].text
        except Exception as e:
            raise TextGenerationError(f"Erro ao gerar chat com Anthropic: {str(e)}")
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Gera embeddings usando Anthropic"""
        try:
            response = await self.client.embeddings.create(
                model="claude-3-sonnet-20240229",
                input=text
            )
            return response.embedding
        except Exception as e:
            raise EmbeddingError(f"Erro ao gerar embedding com Anthropic: {str(e)}")
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o provider Anthropic"""
        return {
            "provider": "anthropic",
            "provider_class": "AnthropicProvider",
            "has_embeddings": True,
            "api_key_configured": self.validate_config(),
            "available_models": ["claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
            "embedding_model": "claude-3-sonnet-20240229"
        }
