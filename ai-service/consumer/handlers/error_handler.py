"""
Handler centralizado para tratamento de erros
"""

from typing import Optional, Dict, Any
from consumer.utils.logger import logger


class ErrorHandler:
    """Handler centralizado para tratamento de erros"""
    
    @staticmethod
    def handle_sqs_error(error: Exception, context: Dict[str, Any]) -> None:
        """
        Trata erros relacionados ao SQS
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        error_type = type(error).__name__
        
        if "NoCredentialsError" in error_type:
            logger.critical(
                "🔐 Erro de credenciais AWS",
                error=str(error),
                context=context
            )
        elif "ClientError" in error_type:
            logger.error(
                "📡 Erro de cliente SQS",
                error=str(error),
                context=context
            )
        else:
            logger.error(
                "❌ Erro inesperado SQS",
                error=str(error),
                context=context
            )
    
    @staticmethod
    def handle_download_error(error: Exception, context: Dict[str, Any]) -> None:
        """
        Trata erros relacionados ao download
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        error_type = type(error).__name__
        
        if "Timeout" in error_type:
            logger.warning(
                "⏰ Timeout no download",
                error=str(error),
                context=context
            )
        elif "ConnectionError" in error_type:
            logger.error(
                "🌐 Erro de conexão no download",
                error=str(error),
                context=context
            )
        else:
            logger.error(
                "❌ Erro inesperado no download",
                error=str(error),
                context=context
            )
    
    @staticmethod
    def handle_ai_service_error(error: Exception, context: Dict[str, Any]) -> None:
        """
        Trata erros relacionados ao serviço de IA
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        error_type = type(error).__name__
        
        if "AuthenticationError" in error_type:
            logger.critical(
                "🔑 Erro de autenticação com serviço de IA",
                error=str(error),
                context=context
            )
        elif "RateLimitError" in error_type:
            logger.warning(
                "🚦 Rate limit atingido no serviço de IA",
                error=str(error),
                context=context
            )
        else:
            logger.error(
                "❌ Erro inesperado no serviço de IA",
                error=str(error),
                context=context
            )
    
    @staticmethod
    def handle_backend_error(error: Exception, context: Dict[str, Any]) -> None:
        """
        Trata erros relacionados ao backend
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        error_type = type(error).__name__
        
        if "ConnectionError" in error_type:
            logger.error(
                "🌐 Erro de conexão com backend",
                error=str(error),
                context=context
            )
        elif "Timeout" in error_type:
            logger.warning(
                "⏰ Timeout na comunicação com backend",
                error=str(error),
                context=context
            )
        else:
            logger.error(
                "❌ Erro inesperado na comunicação com backend",
                error=str(error),
                context=context
            )
    
    @staticmethod
    def handle_validation_error(error: Exception, context: Dict[str, Any]) -> None:
        """
        Trata erros de validação
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        logger.warning(
            "⚠️ Erro de validação",
            error=str(error),
            context=context
        )
    
    @staticmethod
    def handle_unexpected_error(error: Exception, context: Dict[str, Any]) -> None:
        """
        Trata erros inesperados
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        logger.critical(
            "💥 Erro inesperado crítico",
            error=str(error),
            error_type=type(error).__name__,
            context=context
        )
    
    @staticmethod
    def get_error_summary() -> Dict[str, Any]:
        """
        Retorna um resumo dos erros tratados
        
        Returns:
            Dicionário com resumo dos erros
        """
        # Esta é uma implementação básica
        # Em produção, você pode querer manter estatísticas de erros
        return {
            'error_handler': 'active',
            'version': '1.0.0'
        }
