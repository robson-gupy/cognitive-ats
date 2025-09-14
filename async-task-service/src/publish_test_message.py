import json
import logging
import os
from datetime import datetime
from uuid import uuid4

import redis
from dotenv import load_dotenv


def _get_env(name: str, default: str) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Variável de ambiente obrigatória ausente: {name}")
    return value


def create_redis_client() -> redis.Redis:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    if redis_url:
        return redis.from_url(redis_url, decode_responses=True)  # type: ignore[return-value]
    host = _get_env("REDIS_HOST", "localhost")
    port = int(_get_env("REDIS_PORT", "6379"))
    db = int(_get_env("REDIS_DB", "0"))
    return redis.Redis(host=host, port=port, db=db, decode_responses=True)


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s - %(message)s")
    queue_name = "applications-queue"
    client = create_redis_client()

    message = {
        "id": str(uuid4()),
        "event": "test",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "payload": {"applicationId": "38ad549d-e595-4513-892f-bc41fedc7b9c", "resumeUrl": "/cognitive-ats-uploads/resume_1757714230692_c3a658edaadd559b206d1bcb0a4b2011d4b07d5f31d71f76fae9a26c091a25f0.pdf", "eventType": "APPLICATION_CREATED", "timestamp": "2025-09-12T21:57:11.056Z"},
    }
    payload = json.dumps(message, ensure_ascii=False)
    client.rpush(queue_name, payload)
    logging.info(f"Mensagem publicada na fila '{queue_name}': {payload}")


if __name__ == "__main__":
    main()
