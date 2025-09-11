"""
Serviço de fila baseado em Redis Streams com consumer groups.
Compatível com a interface do SQSService utilizada pelos handlers_tmp.
"""

from typing import List, Optional, Dict, Any
import json
import redis

from consumer.utils.logger import logger
from consumer.models.message import QueueMessage


class StreamsRedisService:
    """Operações com Redis Streams usando grupos de consumidores"""

    def __init__(self, redis_config: Dict[str, Any]):
        """Inicializa o serviço Redis Streams.

        Espera chaves: url, host, port, db, stream_name, group_name, consumer_name,
        block_ms, count, max_retries
        """
        self.config = redis_config
        self.client: Optional[redis.Redis] = None
        self.stream: str = redis_config.get('stream_name')
        self.group: str = redis_config.get('group_name')
        self.consumer: str = redis_config.get('consumer_name')
        self.block_ms: int = int(redis_config.get('block_ms', 20000))
        self.count: int = int(redis_config.get('count', 10))
        self.max_retries: int = int(redis_config.get('max_retries', 3))
        self._connect()

    def _connect(self):
        try:
            if self.config.get('url'):
                self.client = redis.from_url(self.config['url'], decode_responses=True)
            else:
                self.client = redis.Redis(
                    host=self.config.get('host', 'redis'),
                    port=int(self.config.get('port', 6379)),
                    db=int(self.config.get('db', 0)),
                    decode_responses=True,
                )

            # Garante que o stream existe e o grupo está criado
            try:
                # XGROUP CREATE mkstream: cria stream se não existir
                self.client.xgroup_create(name=self.stream, groupname=self.group, id='$', mkstream=True)
                logger.info(f"✅ Grupo Redis Streams criado: stream={self.stream}, group={self.group}")
            except redis.ResponseError as e:
                if "BUSYGROUP" in str(e):
                    logger.info(f"ℹ️ Grupo Redis Streams já existe: {self.group}")
                else:
                    raise

            logger.info(
                f"✅ Cliente Redis conectado - Stream: {self.stream}, Group: {self.group}, Consumer: {self.consumer}"
            )
        except Exception as e:
            logger.error(f"❌ Erro ao conectar Redis: {e}")
            self.client = None

    def is_connected(self) -> bool:
        return self.client is not None

    def get_queue_info(self) -> Dict[str, Any]:
        if not self.is_connected():
            return {}
        return {
            'stream_name': self.stream,
            'group_name': self.group,
            'consumer_name': self.consumer,
            'count': self.count,
            'block_ms': self.block_ms,
            'max_retries': self.max_retries,
        }

    def receive_messages(self) -> List[QueueMessage]:
        if not self.is_connected():
            logger.error("❌ Cliente Redis não conectado")
            return []

        try:
            # XREADGROUP para ler mensagens pendentes primeiro ('0'), depois novas ('>')
            entries = self.client.xreadgroup(
                groupname=self.group,
                consumername=self.consumer,
                streams={self.stream: '>'},
                count=self.count,
                block=self.block_ms,
            )

            messages: List[QueueMessage] = []
            if not entries:
                return messages

            # entries: [(stream, [(id, {field: value, ...}), ...])]
            for _stream, events in entries:
                for event_id, fields in events:
                    body = fields.get('body') or fields.get('Body') or json.dumps(fields)
                    # deliveries: obter via XPENDING quando necessário; aqui marcamos 1
                    attributes = {'deliveries': 1}
                    msg = QueueMessage(
                        message_id=event_id,
                        ack_token=event_id,
                        body=body,
                        attributes=attributes,
                        message_attributes={}
                    )
                    messages.append(msg)
            return messages
        except Exception as e:
            logger.error(f"❌ Erro ao ler do Redis Streams: {e}")
            return []

    def delete_message(self, ack_token: str) -> bool:
        """Marca como processada (XACK) e tenta remover com XRANGE trim opcional."""
        if not self.is_connected():
            return False
        try:
            self.client.xack(self.stream, self.group, ack_token)
            # Opcionalmente, poderíamos XDEL para remover do stream
            self.client.xdel(self.stream, ack_token)
            logger.info("🗑️ Mensagem confirmada e removida do stream")
            return True
        except Exception as e:
            logger.error(f"❌ Erro ao confirmar/remover mensagem no Redis: {e}")
            return False

    def send_message(self, message_body: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.is_connected():
            return None
        try:
            body_str = json.dumps(message_body, ensure_ascii=False, default=str)
            message_id = self.client.xadd(self.stream, {'body': body_str})
            return {'MessageId': message_id, 'stream': self.stream}
        except Exception as e:
            logger.error(f"❌ Erro ao enviar mensagem para Redis Streams: {e}")
            return None


