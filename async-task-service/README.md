### Redis Queue Consumer (Python)

Consumer com suporte a múltiplas filas, roteamento por nome de fila para handlers, retentativas com backoff exponencial e DLQ.

### Requisitos
- Python 3.10+
- Redis 6/7

### Instalação rápida
```bash
cd /Users/robson/src/pessoal/studies/RedisQueueConsumer
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Variáveis de ambiente
- `REDIS_URL` (ex: `redis://localhost:6379/0`)
- Alternativa: `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`
- `QUEUES_NAMES` lista separada por vírgulas (ex: `send-email-queue,close-job-queue`)
- `LOG_LEVEL` (INFO/DEBUG)
- `BLPOP_TIMEOUT_SECONDS` (default 5)
- `MAX_RETRIES` (default 3)
- `RETRY_BASE_DELAY_SECONDS` (default 2)

### Executar consumer
```bash
python src/consumer.py
```

### Publicar mensagens de teste
```bash
python src/publish_test_message.py  # publica em QUEUES_NAMES (primeira fila)
```

### Handlers
- Adicione novos handlers em `src/handlers/`.
- Registre-os em `src/handlers/config.py` mapeando `nome_da_fila -> handler`.

Exemplo simplificado em `config.py`:
```python
from .registry import registry
from .examples import handler_send_email

registry.register("send-email-queue", handler_send_email)
```

### Retentativas e DLQ
- Falhas no handler causam retentativas com backoff exponencial.
- Após exceder `MAX_RETRIES`, a mensagem vai para `queue:dlq`.
- Mensagens de retry aguardam em `queue:retry` (ZSET) até o horário programado.

### Docker Compose
```bash
docker compose up --build
```
- Consumer lê `QUEUES` e se conecta ao serviço `redis` interno.

### Desenvolvimento
```bash
pip install -r requirements-dev.txt
pre-commit install
```
Rodar manualmente:
```bash
ruff check --fix
ruff format
mypy src
```

### Observações
- Edite `handlers/examples.py` para se basear e criar novos handlers.

