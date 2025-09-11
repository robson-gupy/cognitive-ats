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
    queue_name = _get_env("QUEUES_NAMES", "send-email-queue")
    client = create_redis_client()

    message = {
        "id": str(uuid4()),
        "event": "test",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "payload": {"hello": "world"},
    }
    payload = json.dumps(message, ensure_ascii=False)
    client.rpush(queue_name, payload)
    logging.info("Mensagem publicada na fila '%s': %s", queue_name, payload)


if __name__ == "__main__":
    main()
