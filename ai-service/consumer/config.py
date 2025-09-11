from __future__ import annotations

from consumer.handlers.examples import handler_send_email, handler_close_job
from consumer.registry import registry


def register_handlers() -> None:
    # Edite este arquivo para mapear filas para handlers
    # Exemplo de mapeamentos padrão:
    registry.register("send-email-queue", handler_send_email)
    registry.register("close-job-queue", handler_close_job)
