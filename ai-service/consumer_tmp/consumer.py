import os
import signal
import sys
import json
import logging
import time
from typing import Optional, Dict, Any

import redis
from dotenv import load_dotenv

from handlers.base import get_dlq_name
from handlers.config import register_handlers
from handlers.registry import registry


shutdown_requested = False


def _request_shutdown(signum, frame):  # type: ignore[no-untyped-def]
    global shutdown_requested
    shutdown_requested = True
    logging.getLogger(__name__).info("Sinal %s recebido. Encerrando...", signum)


def _get_env(name: str, default: Optional[str] = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Variável de ambiente obrigatória ausente: {name}")
    return value


def setup_logging() -> None:
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def create_redis_client() -> redis.Redis:
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        return redis.from_url(redis_url, decode_responses=True)  # type: ignore[return-value]

    # Fallback para host/port/db
    host = _get_env("REDIS_HOST", "localhost")
    port = int(_get_env("REDIS_PORT", "6379"))
    db = int(_get_env("REDIS_DB", "0"))
    return redis.Redis(host=host, port=port, db=db, decode_responses=True)


def get_retry_key(queue_name: str) -> str:
    return f"{queue_name}:retry"


def handle_with_retry(client: redis.Redis, queue_name: str, raw_value: str) -> None:
    logger = logging.getLogger("consumer")

    handler = registry.get(queue_name)
    if handler is None:
        logger.error("Nenhum handler registrado para a fila '%s'. Enviando para DLQ.", queue_name)
        client.rpush(get_dlq_name(queue_name), raw_value)
        return

    max_retries = int(_get_env("MAX_RETRIES", "3"))
    base_delay = float(_get_env("RETRY_BASE_DELAY_SECONDS", "2"))

    # Mensagens devem ser JSON; caso contrário, vão para DLQ
    try:
        message: Dict[str, Any] = json.loads(raw_value)
    except json.JSONDecodeError:
        logger.error("Mensagem inválida (não-JSON) para fila '%s'. Enviando para DLQ.", queue_name)
        client.rpush(get_dlq_name(queue_name), raw_value)
        return

    retry_count = 0
    if "_meta" in message and isinstance(message["_meta"], dict):
        retry_count = int(message["_meta"].get("retry_count", 0))

    try:
        handler(message, client, queue_name)
        return
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Handler falhou para fila '%s' (tentativa %s/%s): %s",
            queue_name,
            retry_count + 1,
            max_retries,
            exc,
        )

        retry_count += 1
        if retry_count > max_retries:
            logger.error("Excedeu tentativas para fila '%s'. Enviando para DLQ.", queue_name)
            client.rpush(get_dlq_name(queue_name), raw_value)
            return

        # Atualiza metadados de retentativa no payload (JSON)
        meta = dict(message.get("_meta", {}))
        meta["retry_count"] = retry_count
        message["_meta"] = meta
        next_payload = json.dumps(message, ensure_ascii=False)

        # Backoff exponencial simples
        delay_seconds = base_delay * (2 ** (retry_count - 1))
        next_available_at = time.time() + delay_seconds
        retry_key = get_retry_key(queue_name)
        client.zadd(retry_key, {next_payload: next_available_at})
        logger.info("Reagendado para retry em %.2f s (fila=%s)", delay_seconds, queue_name)


def drain_due_retries(client: redis.Redis, queue_name: str) -> None:
    retry_key = get_retry_key(queue_name)
    now = time.time()
    # Busca itens vencidos (prontos) em pequenos lotes
    items = client.zrangebyscore(retry_key, min=-1, max=now, start=0, num=10)
    if not items:
        return
    # Move cada item da zset para a fila principal de forma atômica
    with client.pipeline() as pipe:
        for item in items:
            pipe.zrem(retry_key, item)
            pipe.lpush(queue_name, item)
        pipe.execute()


def main() -> int:
    load_dotenv()
    setup_logging()
    logger = logging.getLogger("consumer")

    client = create_redis_client()

    # Registrar handlers
    register_handlers()

    # Filas que vamos consumir: obrigatória via env var lista separada por vírgula
    queues_csv = _get_env("QUEUES_NAMES")
    queues = [q.strip() for q in queues_csv.split(",") if q.strip()]
    blpop_timeout = int(_get_env("BLPOP_TIMEOUT_SECONDS", "5"))

    logger.info("Conectado ao Redis. Consumindo das filas: %s", queues)

    # Registrar sinais de encerramento
    signal.signal(signal.SIGINT, _request_shutdown)
    signal.signal(signal.SIGTERM, _request_shutdown)

    while not shutdown_requested:
        try:
            # Antes de bloquear, drenamos eventuais retries prontos
            for q in queues:
                drain_due_retries(client, q)

            item = client.blpop(queues, timeout=blpop_timeout)
            if item is None:
                continue
            queue_name, value = item
            handle_with_retry(client, queue_name, value)
        except redis.ConnectionError as exc:  # type: ignore[attr-defined]
            logger.error("Erro de conexão com Redis: %s", exc)
            timeout_reconnect_seconds = 2
            logger.info("Tentando reconectar em %s s...", timeout_reconnect_seconds)
            try:
                time.sleep(timeout_reconnect_seconds)
            except KeyboardInterrupt:
                break
        except Exception as exc:  # noqa: BLE001
            logger.exception("Erro inesperado ao consumir mensagens: %s", exc)

    logger.info("Consumer encerrado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
