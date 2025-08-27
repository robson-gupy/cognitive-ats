"""
Configurações centralizadas para o consumer SQS
"""

import os
from typing import Optional
from dataclasses import dataclass


@dataclass
class SQSSettings:
    """Configurações para conexão SQS"""
    endpoint_url: str
    access_key_id: str
    secret_access_key: str
    region: str
    queue_name: str
    max_retries: int = 3
    wait_time_seconds: int = 20
    max_messages: int = 10


@dataclass
class BackendSettings:
    """Configurações para comunicação com backend"""
    url: str
    timeout: int = 30


@dataclass
class ProcessingSettings:
    """Configurações para processamento"""
    download_timeout: int = 30
    temp_file_suffix: str = '.pdf'


@dataclass
class LoggingSettings:
    """Configurações para logging"""
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


class ConsumerSettings:
    """Configurações centralizadas do consumer"""
    
    def __init__(self):
        self.sqs = self._load_sqs_settings()
        self.backend = self._load_backend_settings()
        self.processing = self._load_processing_settings()
        self.logging = self._load_logging_settings()
    
    def _load_sqs_settings(self) -> SQSSettings:
        """Carrega configurações SQS das variáveis de ambiente"""
        return SQSSettings(
            endpoint_url=os.getenv('AWS_ENDPOINT_URL', 'http://localhost:4566'),
            access_key_id=os.getenv('AWS_ACCESS_KEY_ID', 'test'),
            secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY', 'test'),
            region=os.getenv('AWS_REGION', 'us-east-1'),
            queue_name=os.getenv('APPLICATIONS_SQS_QUEUE_NAME', 'applications-queue'),
            max_retries=int(os.getenv('SQS_MAX_RETRIES', '3')),
            wait_time_seconds=int(os.getenv('SQS_WAIT_TIME', '20')),
            max_messages=int(os.getenv('SQS_MAX_MESSAGES', '10'))
        )
    
    def _load_backend_settings(self) -> BackendSettings:
        """Carrega configurações do backend das variáveis de ambiente"""
        return BackendSettings(
            url=os.getenv('BACKEND_URL', 'http://localhost:3000'),
            timeout=int(os.getenv('BACKEND_TIMEOUT', '30'))
        )
    
    def _load_processing_settings(self) -> ProcessingSettings:
        """Carrega configurações de processamento das variáveis de ambiente"""
        return ProcessingSettings(
            download_timeout=int(os.getenv('DOWNLOAD_TIMEOUT', '30')),
            temp_file_suffix=os.getenv('TEMP_FILE_SUFFIX', '.pdf')
        )
    
    def _load_logging_settings(self) -> LoggingSettings:
        """Carrega configurações de logging das variáveis de ambiente"""
        return LoggingSettings(
            level=os.getenv('LOG_LEVEL', 'INFO'),
            format=os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
    
    def validate(self) -> bool:
        """Valida se todas as configurações obrigatórias estão presentes"""
        required_vars = [
            self.sqs.endpoint_url,
            self.sqs.access_key_id,
            self.sqs.secret_access_key,
            self.sqs.region,
            self.sqs.queue_name
        ]
        
        return all(required_vars)
    
    def get_sqs_config(self) -> dict:
        """Retorna configuração SQS para boto3"""
        return {
            'endpoint_url': self.sqs.endpoint_url,
            'aws_access_key_id': self.sqs.access_key_id,
            'aws_secret_access_key': self.sqs.secret_access_key,
            'region_name': self.sqs.region
        }


# Instância global das configurações
settings = ConsumerSettings()
