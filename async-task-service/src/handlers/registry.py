from __future__ import annotations

from typing import Dict

from config.handler_settings import QUEUE_HANDLERS, QUEUES_NAMES
from .base import Handler


class HandlerRegistry:
    def __init__(self) -> None:
        self._queue_to_handler: Dict[str, Handler] = {}

    def register(self, queue_name: str, handler: Handler) -> None:
        self._queue_to_handler[queue_name] = handler

    def get(self, queue_name: str) -> Handler | None:
        return self._queue_to_handler.get(queue_name)


registry = HandlerRegistry()


def register_handlers() -> None:
    # Registra handlers para todas as filas configuradas
    for queue_name in QUEUES_NAMES:
        handler = QUEUE_HANDLERS.get(queue_name)
        if handler:
            registry.register(queue_name, handler)
        else:
            raise ValueError(f"Nenhum handler configurado para a fila: {queue_name}")
