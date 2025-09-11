from __future__ import annotations

import logging
from typing import Dict, Any

import redis

logger = logging.getLogger(__name__)


def handler_send_email(message: Dict[str, Any], client: redis.Redis, queue_name: str) -> None:
    raise RuntimeError("Erro ao enviar email")
    logger.info("[send_email] Enviando email: %s", message)


def handler_close_job(message: Dict[str, Any], client: redis.Redis, queue_name: str) -> None:
    logger.info("[close_job] Encerrando job: %s", message)


def resume_parser_handler(message: Dict[str, Any]):

