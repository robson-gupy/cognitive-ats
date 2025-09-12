from __future__ import annotations

import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


async def handler_send_email(message: Dict[str, Any]) -> None:
    # Simula operação async (ex: chamada HTTP, envio de email)
    await asyncio.sleep(0.1)
    raise RuntimeError("Erro ao enviar email")
    logger.info("[send_email] Enviando email: %s", message)


async def handler_close_job(message: Dict[str, Any]) -> None:
    # Simula operação async (ex: atualização no banco de dados)
    await asyncio.sleep(0.05)
    logger.info("[close_job] Encerrando job: %s", message)
