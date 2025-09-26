"""
Configurações centralizadas para o consumer Redis
"""

import os
from typing import Optional
from dataclasses import dataclass


@dataclass
class DatabaseSettings:
    """Configurações para conexão com banco de dados"""
    host: str
    port: int
    username: str
    password: str
    name: str


@dataclass
class BackendSettings:
    """Configurações para comunicação com backend"""
    url: str
    timeout: int = 30


@dataclass
class CompaniesBackendSettings:
    """Configurações para comunicação com companies-backend"""
    url: str
    timeout: int = 30


@dataclass
class AIServiceSettings:
    """Configurações para comunicação com AI Service"""
    url: str
    timeout: int = 120  # Timeout maior para processamento de IA


@dataclass
class EvaluationSettings:
    """Configurações para avaliação de candidatos"""
    provider: str
    model: str


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


@dataclass
class StorageSettings:
    """Configurações para serviço de storage (MinIO/S3)"""
    url: str
    access_key: str
    secret_key: str
    bucket_name: str
    region: str = "us-east-1"


@dataclass
class RedisSettings:
    """Configurações para conexão Redis/Streams"""
    url: Optional[str]
    host: str
    port: int
    db: int
    stream_name: str
    group_name: str
    consumer_name: str
    max_retries: int = 3
    block_ms: int = 20000
    count: int = 10


@dataclass
class AIScoreRedisSettings:
    """Configurações para stream Redis de scores"""
    url: Optional[str]
    host: str
    port: int
    db: int
    stream_name: str
    group_name: str
    consumer_name: str
    max_retries: int = 3
    block_ms: int = 20000
    count: int = 10


class ConsumerSettings:
    """Configurações centralizadas do consumer"""

    def __init__(self):
        self.redis = self._load_redis_settings()
        self.ai_score_redis = self._load_ai_score_redis_settings()
        self.database = self._load_database_settings()
        self.backend = self._load_backend_settings()
        self.companies_backend = self._load_companies_backend_settings()
        self.ai_service = self._load_ai_service_settings()
        self.evaluation = self._load_evaluation_settings()
        self.storage = self._load_storage_settings()
        self.processing = self._load_processing_settings()
        self.logging = self._load_logging_settings()

    def _load_redis_settings(self) -> RedisSettings:
        """Carrega configurações Redis das variáveis de ambiente"""
        return RedisSettings(
            url=os.getenv('REDIS_URL'),
            host=os.getenv('REDIS_HOST', 'redis'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            db=int(os.getenv('REDIS_DB', '0')),
            stream_name=os.getenv('APPLICATIONS_REDIS_STREAM', 'applications-stream'),
            group_name=os.getenv('APPLICATIONS_REDIS_GROUP', 'applications-group'),
            consumer_name=os.getenv('APPLICATIONS_REDIS_CONSUMER', 'consumer-1'),
            max_retries=int(os.getenv('REDIS_MAX_RETRIES', '3')),
            block_ms=int(os.getenv('REDIS_BLOCK_MS', '20000')),
            count=int(os.getenv('REDIS_MAX_MESSAGES', '10'))
        )

    def _load_ai_score_redis_settings(self) -> AIScoreRedisSettings:
        """Carrega configurações Redis para scores das variáveis de ambiente"""
        return AIScoreRedisSettings(
            url=os.getenv('REDIS_URL'),
            host=os.getenv('REDIS_HOST', 'redis'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            db=int(os.getenv('REDIS_DB', '0')),
            stream_name=os.getenv('AI_SCORE_QUEUE_NAME', 'ai-score-queue'),
            group_name=os.getenv('APPLICATIONS_AI_SCORE_REDIS_GROUP', 'applications-ai-score-group'),
            consumer_name=os.getenv('APPLICATIONS_AI_SCORE_REDIS_CONSUMER', 'consumer-1'),
            max_retries=int(os.getenv('REDIS_MAX_RETRIES', '3')),
            block_ms=int(os.getenv('REDIS_BLOCK_MS', '20000')),
            count=int(os.getenv('REDIS_MAX_MESSAGES', '10'))
        )

    def _load_database_settings(self) -> DatabaseSettings:
        """Carrega configurações de banco de dados das variáveis de ambiente"""
        return DatabaseSettings(
            host=os.getenv('DB_HOST', 'postgres'),
            port=int(os.getenv('DB_PORT', '5432')),
            username=os.getenv('DB_USERNAME', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres'),
            name=os.getenv('DB_NAME', 'cognitive_ats')
        )

    def _load_backend_settings(self) -> BackendSettings:
        """Carrega configurações do backend das variáveis de ambiente"""
        # Usa apenas BACKEND_URL, sem fallback para AI_SERVICE_URL
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:8000')
        return BackendSettings(
            url=backend_url,
            timeout=int(os.getenv('BACKEND_TIMEOUT', '30'))
        )

    def _load_companies_backend_settings(self) -> CompaniesBackendSettings:
        """Carrega configurações do companies-backend das variáveis de ambiente"""
        companies_url = os.getenv('COMPANIES_API_URL', 'http://localhost:3000')
        return CompaniesBackendSettings(
            url=companies_url,
            timeout=int(os.getenv('COMPANIES_BACKEND_TIMEOUT', '30'))
        )

    def _load_ai_service_settings(self) -> AIServiceSettings:
        """Carrega configurações do AI Service das variáveis de ambiente"""
        ai_service_url = os.getenv('AI_SERVICE_URL', 'http://localhost:8000')
        return AIServiceSettings(
            url=ai_service_url,
            timeout=int(os.getenv('AI_SERVICE_TIMEOUT', '120'))
        )

    def _load_evaluation_settings(self) -> EvaluationSettings:
        """Carrega configurações de avaliação das variáveis de ambiente"""
        return EvaluationSettings(
            provider=os.getenv('EVALUATION_PROVIDER', 'openai'),
            model=os.getenv('EVALUATION_MODEL', 'gpt-4')
        )

    def _load_storage_settings(self) -> StorageSettings:
        """Carrega configurações do storage (MinIO/S3) das variáveis de ambiente"""
        return StorageSettings(
            url=os.getenv('STORAGE_URL', 'http://localhost:9000'),
            access_key=os.getenv('STORAGE_ACCESS_KEY', 'minioadmin'),
            secret_key=os.getenv('STORAGE_SECRET_KEY', 'minioadmin'),
            bucket_name=os.getenv('STORAGE_BUCKET_NAME', 'cognitive-ats'),
            region=os.getenv('STORAGE_REGION', 'us-east-1')
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
            self.redis.host,
            self.redis.port,
            self.redis.stream_name,
            self.redis.group_name,
            self.redis.consumer_name,
            self.ai_score_redis.host,
            self.ai_score_redis.port,
            self.ai_score_redis.stream_name,
            self.ai_score_redis.group_name,
            self.ai_score_redis.consumer_name,
            self.database.host,
            self.database.username,
            self.database.password,
            self.database.name,
            self.storage.url,
            self.storage.access_key,
            self.storage.secret_key,
            self.storage.bucket_name
        ]
        return all(required_vars)


    def get_redis_config(self) -> dict:
        """Retorna configuração Redis"""
        return {
            'url': self.redis.url,
            'host': self.redis.host,
            'port': self.redis.port,
            'db': self.redis.db,
            'stream_name': self.redis.stream_name,
            'group_name': self.redis.group_name,
            'consumer_name': self.redis.consumer_name,
            'block_ms': self.redis.block_ms,
            'count': self.redis.count,
            'max_retries': self.redis.max_retries
        }

    def get_ai_score_redis_config(self) -> dict:
        """Retorna configuração Redis para scores"""
        return {
            'url': self.ai_score_redis.url,
            'host': self.ai_score_redis.host,
            'port': self.ai_score_redis.port,
            'db': self.ai_score_redis.db,
            'stream_name': self.ai_score_redis.stream_name,
            'group_name': self.ai_score_redis.group_name,
            'consumer_name': self.ai_score_redis.consumer_name,
            'block_ms': self.ai_score_redis.block_ms,
            'count': self.ai_score_redis.count,
            'max_retries': self.ai_score_redis.max_retries
        }

    def get_storage_config(self) -> dict:
        """Retorna configuração do storage (MinIO/S3)"""
        return {
            'url': self.storage.url,
            'access_key': self.storage.access_key,
            'secret_key': self.storage.secret_key,
            'bucket_name': self.storage.bucket_name,
            'region': self.storage.region
        }


# Instância global das configurações
settings = ConsumerSettings()
