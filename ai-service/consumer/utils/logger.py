"""
Sistema de logging estruturado para o consumer
"""

import logging
import sys
from typing import Optional
from consumer.config.settings import settings


class ConsumerLogger:
    """Logger estruturado para o consumer"""
    
    def __init__(self, name: str = "consumer"):
        self.logger = logging.getLogger(name)
        self._setup_logger()
    
    def _setup_logger(self):
        """Configura o logger com formatação e handlers"""
        # Remove handlers existentes para evitar duplicação
        self.logger.handlers.clear()
        
        # Define o nível de log
        log_level = getattr(logging, settings.logging.level.upper(), logging.INFO)
        self.logger.setLevel(log_level)
        
        # Handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        
        # Formatação
        formatter = logging.Formatter(settings.logging.format)
        console_handler.setFormatter(formatter)
        
        # Adiciona handler
        self.logger.addHandler(console_handler)
        
        # Evita propagação para logger raiz
        self.logger.propagate = False
    
    def info(self, message: str, **kwargs):
        """Log de informação"""
        self.logger.info(message, extra=kwargs)
    
    def error(self, message: str, **kwargs):
        """Log de erro"""
        self.logger.error(message, extra=kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log de aviso"""
        self.logger.warning(message, extra=kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log de debug"""
        self.logger.debug(message, extra=kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log crítico"""
        self.logger.critical(message, extra=kwargs)
    
    def log_processing_start(self, application_id: str, message_id: str):
        """Log do início do processamento"""
        self.info(
            "🔄 Iniciando processamento de currículo",
            application_id=application_id,
            message_id=message_id
        )
    
    def log_processing_success(self, application_id: str, message_id: str, processing_time: float):
        """Log de sucesso no processamento"""
        self.info(
            "✅ Currículo processado com sucesso",
            application_id=application_id,
            message_id=message_id,
            processing_time=processing_time
        )
    
    def log_processing_error(self, application_id: str, message_id: str, error: str):
        """Log de erro no processamento"""
        self.error(
            "❌ Erro no processamento de currículo",
            application_id=application_id,
            message_id=message_id,
            error=error
        )
    
    def log_download_start(self, url: str):
        """Log do início do download"""
        self.info("📥 Iniciando download", url=url)
    
    def log_download_success(self, file_path: str, file_size: int):
        """Log de sucesso no download"""
        self.info(
            "✅ Download concluído",
            file_path=file_path,
            file_size=file_size
        )
    
    def log_download_error(self, url: str, error: str):
        """Log de erro no download"""
        self.error(
            "❌ Erro no download",
            url=url,
            error=error
        )
    
    def log_backend_communication(self, url: str, status_code: int):
        """Log de comunicação com backend"""
        if status_code in [200, 201]:
            self.info(
                "📤 Dados enviados ao backend com sucesso",
                url=url,
                status_code=status_code
            )
        else:
            self.error(
                "❌ Erro na comunicação com backend",
                url=url,
                status_code=status_code
            )


# Logger global
logger = ConsumerLogger()
