"""
Serviços do consumer
"""

from .sqs_service import SQSService  # noqa: F401

try:
    from .streams_redis_service import StreamsRedisService  # noqa: F401
except Exception:  # pragma: no cover
    # O módulo pode não existir durante a migração
    StreamsRedisService = None
