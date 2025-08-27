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
        self.info(f"🔄 Iniciando processamento de currículo - Application ID: {application_id}, Message ID: {message_id}")
    
    def log_processing_success(self, application_id: str, message_id: str, processing_time: float):
        """Log de sucesso no processamento"""
        self.info(f"✅ Currículo processado com sucesso - Application ID: {application_id}, Message ID: {message_id}, Tempo: {processing_time:.2f}s")
    
    def log_processing_error(self, application_id: str, message_id: str, error: str):
        """Log de erro no processamento"""
        self.error(f"❌ Erro no processamento de currículo - Application ID: {application_id}, Message ID: {message_id}, Erro: {error}")
    
    def log_download_start(self, url: str):
        """Log do início do download"""
        self.info(f"📥 Iniciando download: {url}")
    
    def log_download_success(self, file_path: str, file_size: int):
        """Log de sucesso no download"""
        self.info(f"✅ Download concluído - Arquivo: {file_path}, Tamanho: {file_size} bytes")
    
    def log_download_error(self, url: str, error: str):
        """Log de erro no download"""
        self.error(f"❌ Erro no download - URL: {url}, Erro: {error}")
    
    def log_backend_communication(self, url: str, status_code: int):
        """Log de comunicação com backend"""
        if status_code in [200, 201]:
            self.info(f"📤 Dados enviados ao backend com sucesso - URL: {url}, Status: {status_code}")
        else:
            self.error(f"❌ Erro na comunicação com backend - URL: {url}, Status: {status_code}")


# Logger global
logger = ConsumerLogger()
