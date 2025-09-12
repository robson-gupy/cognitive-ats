import asyncio
import os
import signal
import sys
import json
import logging
import time
from typing import Optional, Dict, Any, Set

import redis.asyncio as redis
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


async def create_redis_client() -> redis.Redis:
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        return redis.from_url(redis_url, decode_responses=True)

    # Fallback para host/port/db
    host = _get_env("REDIS_HOST", "localhost")
    port = int(_get_env("REDIS_PORT", "6379"))
    db = int(_get_env("REDIS_DB", "0"))
    return redis.Redis(host=host, port=port, db=db, decode_responses=True)


def get_retry_key(queue_name: str) -> str:
    return f"{queue_name}:retry"


async def handle_with_retry(client: redis.Redis, queue_name: str, raw_value: str) -> None:
    logger = logging.getLogger("consumer")

    handler = registry.get(queue_name)
    if handler is None:
        logger.error("Nenhum handler registrado para a fila '%s'. Enviando para DLQ.", queue_name)
        await client.rpush(get_dlq_name(queue_name), raw_value)
        return

    max_retries = int(_get_env("MAX_RETRIES", "3"))
    base_delay = float(_get_env("RETRY_BASE_DELAY_SECONDS", "2"))

    # Mensagens devem ser JSON; caso contrário, vão para DLQ
    try:
        message: Dict[str, Any] = json.loads(raw_value)
    except json.JSONDecodeError:
        logger.error("Mensagem inválida (não-JSON) para fila '%s'. Enviando para DLQ.", queue_name)
        await client.rpush(get_dlq_name(queue_name), raw_value)
        return

    retry_count = 0
    if "_meta" in message and isinstance(message["_meta"], dict):
        retry_count = int(message["_meta"].get("retry_count", 0))

    try:
        await handler(message)
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
            await client.rpush(get_dlq_name(queue_name), raw_value)
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
        await client.zadd(retry_key, {next_payload: next_available_at})
        logger.info("Reagendado para retry em %.2f s (fila=%s)", delay_seconds, queue_name)


async def drain_due_retries(client: redis.Redis, queue_name: str) -> None:
    retry_key = get_retry_key(queue_name)
    now = time.time()
    # Busca itens vencidos (prontos) em pequenos lotes
    items = await client.zrangebyscore(retry_key, min=-1, max=now, start=0, num=10)
    if not items:
        return
    # Move cada item da zset para a fila principal de forma atômica
    async with client.pipeline() as pipe:
        for item in items:
            await pipe.zrem(retry_key, item)
            await pipe.lpush(queue_name, item)
        await pipe.execute()


async def process_message(client: redis.Redis, queue_name: str, value: str) -> None:
    """Processa uma mensagem de forma assíncrona."""
    try:
        await handle_with_retry(client, queue_name, value)
    except Exception as exc:  # noqa: BLE001
        logger = logging.getLogger("consumer")
        logger.exception("Erro inesperado ao processar mensagem: %s", exc)


async def consumer_worker(client: redis.Redis, queues: list[str], worker_id: int) -> None:
    """Worker que consome mensagens de uma ou mais filas."""
    logger = logging.getLogger(f"consumer.worker-{worker_id}")
    blpop_timeout = int(_get_env("BLPOP_TIMEOUT_SECONDS", "5"))
    
    logger.info("Worker %d iniciado. Consumindo das filas: %s", worker_id, queues)
    
    while not shutdown_requested:
        try:
            # Antes de bloquear, drenamos eventuais retries prontos
            for q in queues:
                await drain_due_retries(client, q)

            item = await client.blpop(queues, timeout=blpop_timeout)
            if item is None:
                continue
            queue_name, value = item
            
            # Processa a mensagem de forma assíncrona
            await process_message(client, queue_name, value)
            
        except redis.ConnectionError as exc:
            logger.error("Erro de conexão com Redis no worker %d: %s", worker_id, exc)
            timeout_reconnect_seconds = 2
            logger.info("Worker %d tentando reconectar em %s s...", worker_id, timeout_reconnect_seconds)
            try:
                await asyncio.sleep(timeout_reconnect_seconds)
            except asyncio.CancelledError:
                break
        except Exception as exc:  # noqa: BLE001
            logger.exception("Erro inesperado no worker %d: %s", worker_id, exc)
    
    logger.info("Worker %d encerrado.", worker_id)


async def main_async() -> int:
    """Função principal assíncrona."""
    load_dotenv()
    setup_logging()
    logger = logging.getLogger("consumer")

    client = await create_redis_client()

    # Registrar handlers
    register_handlers()

    # Filas que vamos consumir: obrigatória via env var lista separada por vírgula
    queues_csv = _get_env("QUEUES_NAMES")
    queues = [q.strip() for q in queues_csv.split(",") if q.strip()]
    
    # Número de workers concorrentes
    num_workers = int(_get_env("NUM_WORKERS", "3"))
    
    logger.info("Conectado ao Redis. Iniciando %d workers para as filas: %s", num_workers, queues)

    # Registrar sinais de encerramento
    signal.signal(signal.SIGINT, _request_shutdown)
    signal.signal(signal.SIGTERM, _request_shutdown)

    # Criar workers concorrentes
    workers = []
    for i in range(num_workers):
        worker = asyncio.create_task(consumer_worker(client, queues, i + 1))
        workers.append(worker)

    try:
        # Aguardar todos os workers
        await asyncio.gather(*workers, return_exceptions=True)
    except KeyboardInterrupt:
        logger.info("Interrupção recebida. Encerrando workers...")
        # Cancelar todos os workers
        for worker in workers:
            worker.cancel()
        # Aguardar cancelamento
        await asyncio.gather(*workers, return_exceptions=True)
    finally:
        await client.close()

    logger.info("Consumer encerrado.")
    return 0


def main() -> int:
    """Função main síncrona que executa o loop assíncrono."""
    return asyncio.run(main_async())


if __name__ == "__main__":
    sys.exit(main())
