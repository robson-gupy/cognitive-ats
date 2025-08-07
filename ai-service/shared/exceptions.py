"""
Exceções customizadas do AI Service
"""


class AIProviderError(Exception):
    """Exceção base para erros de providers de IA"""
    pass


class ProviderNotConfiguredError(AIProviderError):
    """Exceção quando um provider não está configurado"""
    pass


class ProviderNotSupportedError(AIProviderError):
    """Exceção quando um provider não é suportado"""
    pass


class APIKeyError(AIProviderError):
    """Exceção quando há problema com API key"""
    pass


class TextGenerationError(AIProviderError):
    """Exceção quando há erro na geração de texto"""
    pass


class EmbeddingError(AIProviderError):
    """Exceção quando há erro na geração de embeddings"""
    pass


class ResumeParsingError(Exception):
    """Exceção quando há erro no parsing de currículo"""
    pass


class JobCreationError(Exception):
    """Exceção quando há erro na criação de job"""
    pass
