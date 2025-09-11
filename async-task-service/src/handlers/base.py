from __future__ import annotations

from typing import Dict, Any, Protocol


class Handler(Protocol):
    def __call__(self, message: Dict[str, Any]) -> None:  # pragma: no cover - interface
        ...


def get_dlq_name(queue_name: str) -> str:
    return f"{queue_name}:dlq"
