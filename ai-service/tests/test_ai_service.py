"""
Testes para o serviço de IA
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from shared.config import AIProvider
from core.ai.service import AIService
from core.ai.factory import AIProviderFactory


class TestAIService:
    """Testes para o AIService"""
    
    def test_ai_service_initialization(self):
        """Testa a inicialização do AIService"""
        # Mock do provider
        mock_provider = MagicMock()
        mock_provider.generate_text = AsyncMock(return_value="Test response")
        mock_provider.generate_chat = AsyncMock(return_value="Chat response")
        mock_provider.generate_embedding = AsyncMock(return_value=[0.1, 0.2, 0.3])
        mock_provider.get_provider_info.return_value = {
            "provider": "test",
            "provider_class": "TestProvider",
            "has_embeddings": True,
            "api_key_configured": True
        }
        
        # Testa inicialização
        service = AIService(AIProvider.OPENAI, api_key="test-key")
        assert service.provider == AIProvider.OPENAI
    
    def test_factory_get_available_providers(self):
        """Testa se o factory retorna providers disponíveis"""
        providers = AIProviderFactory.get_available_providers()
        assert isinstance(providers, list)
        assert "openai" in providers
        assert "anthropic" in providers
    
    def test_factory_get_provider_info(self):
        """Testa se o factory retorna informações do provider"""
        info = AIProviderFactory.get_provider_info(AIProvider.OPENAI)
        assert isinstance(info, dict)
        assert "provider" in info
        assert "provider_class" in info
        assert "has_embeddings" in info
        assert "api_key_configured" in info


class TestConfig:
    """Testes para configurações"""
    
    def test_ai_provider_enum(self):
        """Testa se o enum AIProvider tem os valores corretos"""
        assert AIProvider.OPENAI.value == "openai"
        assert AIProvider.ANTHROPIC.value == "anthropic"
    
    def test_config_default_values(self):
        """Testa se as configurações padrão estão definidas"""
        from shared.config import Config
        
        assert hasattr(Config, 'DEFAULT_AI_PROVIDER')
        assert hasattr(Config, 'DEFAULT_MODEL')
        assert hasattr(Config, 'DEFAULT_MAX_TOKENS')
        assert hasattr(Config, 'DEFAULT_TEMPERATURE')
        assert hasattr(Config, 'REQUEST_TIMEOUT')
