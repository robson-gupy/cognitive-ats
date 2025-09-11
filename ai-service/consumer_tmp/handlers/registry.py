from __future__ import annotations

from typing import Dict

from .base import Handler


class HandlerRegistry:
    def __init__(self) -> None:
        self._queue_to_handler: Dict[str, Handler] = {}

    def register(self, queue_name: str, handler: Handler) -> None:
        self._queue_to_handler[queue_name] = handler

    def get(self, queue_name: str) -> Handler | None:
        return self._queue_to_handler.get(queue_name)


registry = HandlerRegistry()
