from __future__ import annotations

from typing import Dict, Any, Protocol, Awaitable


class Handler(Protocol):
    def __call__(self, message: Dict[str, Any]) -> Awaitable[None]:  # pragma: no cover - interface
        ...


def get_dlq_name(queue_name: str) -> str:
    return f"{queue_name}:dlq"
