from __future__ import annotations

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def handler_send_email(message: Dict[str, Any]) -> None:
    raise RuntimeError("Erro ao enviar email")
    logger.info("[send_email] Enviando email: %s", message)


def handler_close_job(message: Dict[str, Any]) -> None:
    logger.info("[close_job] Encerrando job: %s", message)
