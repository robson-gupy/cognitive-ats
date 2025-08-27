# Sistema de Dois Listeners SQS - CVs e Scores

## 🎯 Visão Geral

O sistema agora possui **dois listeners SQS** que funcionam em paralelo para processar diferentes tipos de mensagens:

1. **Listener de CVs** - Processa currículos e extrai informações
2. **Listener de Scores** - Calcula scores de candidatos usando IA

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐
│   Fila CVs      │    │  Fila Scores    │
│ applications-   │    │ applications-   │
│ queue           │    │ ai-score-queue  │
└─────────┬───────┘    └─────────┬───────┘
          │                       │
          ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Listener CVs    │    │ Listener Scores │
│ - Download PDF  │    │ - Calcula IA    │
│ - Parse CV      │    │ - Atualiza BD   │
│ - Extrai dados  │    │ - Processa      │
└─────────────────┘    └─────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Banco de      │    │   Banco de      │
│   Dados         │    │   Dados         │
│   (Dados CV)    │    │   (Scores)      │
└─────────────────┘    └─────────────────┘
```

## 🚀 Como Funciona

### 1. Listener de CVs (Existente)

- **Fila**: `APPLICATIONS_SQS_QUEUE_NAME`
- **Função**: Processa currículos em PDF
- **Fluxo**: Download → Parse → Extração → Armazenamento

**Estrutura da mensagem:**
```json
{
  "resumeUrl": "https://exemplo.com/cv.pdf",
  "applicationId": "uuid-da-application",
  "jobId": "uuid-da-vaga",
  "companyId": "uuid-da-empresa"
}
```

### 2. Listener de Scores (NOVO)

- **Fila**: `APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME`
- **Função**: Calcula scores usando IA
- **Fluxo**: Recebe dados → Calcula IA → Atualiza BD

**Estrutura da mensagem:**
```json
{
  "applicationId": "uuid-da-application",
  "resumeData": {
    "personal_info": {"name": "João Silva"},
    "education": [...],
    "experience": [...],
    "skills": [...]
  },
  "jobData": {
    "title": "Desenvolvedor Full Stack",
    "requirements": [...],
    "education_required": "Bacharelado",
    "experience_required": "3+ anos"
  },
  "questionResponses": [
    {
      "question": "Como você lida com prazos?",
      "answer": "Uso metodologias ágeis..."
    }
  ]
}
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Filas SQS
APPLICATIONS_SQS_QUEUE_NAME=applications-queue
APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME=applications-ai-score-queue

# Configurações AWS
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1

# Configurações do banco
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=cognitive_ats

# Configurações do backend
BACKEND_URL=http://localhost:3000
```

### Arquivo .env

Copie o arquivo de exemplo e configure:

```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

## 🚀 Execução

### 1. Iniciar Serviços

```bash
# Iniciar Docker Compose
docker-compose up -d

# Verificar se os serviços estão rodando
docker ps
```

### 2. Configurar Filas SQS

```bash
# Executar script de teste (cria as filas automaticamente)
./test_dual_listeners.sh
```

### 3. Iniciar os Listeners

```bash
cd ai-service/consumer
python main.py
```

**Saída esperada:**
```
=== SQS Consumer - CVs e Scores ===
Versão: 1.0.0

🔧 Configurações carregadas
   Fila SQS CVs: applications-queue
   Fila SQS Scores: applications-ai-score-queue
   Endpoint SQS: http://localhost:4566
   Backend: http://localhost:3000
   Database: postgres:5432/cognitive_ats
   Max Retries: 3
   Log Level: INFO

📊 Status dos serviços:
   SQS CVs: ✅ Conectado
   SQS Scores: ✅ Conectado
   Backend: ✅ Disponível
   IA Service CVs: ✅ Inicializado
   IA Service Scores: ✅ Inicializado
   Database: ✅ Conectado

🚀 Iniciando listeners em paralelo...
🎧 Iniciando processamento de mensagens
🎧 Iniciando processamento de mensagens de score
⏳ Aguardando mensagens... (Ctrl+C para parar)
⏳ Aguardando mensagens... (Ctrl+C para parar)
```

## 🧪 Testando

### 1. Teste Rápido

```bash
# Executar script de teste completo
./test_dual_listeners.sh
```

### 2. Teste Manual

#### Enviar mensagem de CV:
```bash
aws --endpoint-url=http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/applications-queue \
  --message-body '{
    "resumeUrl": "https://exemplo.com/cv.pdf",
    "applicationId": "test-cv-001",
    "jobId": "job-001"
  }'
```

#### Enviar mensagem de score:
```bash
aws --endpoint-url=http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/applications-ai-score-queue \
  --message-body '{
    "applicationId": "test-score-001",
    "resumeData": {
      "personal_info": {"name": "João Silva"},
      "skills": ["JavaScript", "React"]
    },
    "jobData": {
      "title": "Desenvolvedor Frontend",
      "requirements": ["React", "JavaScript"]
    }
  }'
```

### 3. Monitorar Processamento

```bash
# Ver mensagens nas filas
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/applications-queue \
  --attribute-names All

aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/applications-ai-score-queue \
  --attribute-names All
```

## 📊 Monitoramento

### Logs dos Listeners

#### Listener de CVs:
- `📝 Processando mensagem` - Início do processamento
- `⏳ Aguardando resposta do serviço de IA para parsing do currículo...` - Aguardando IA
- `✅ Resposta recebida do serviço de IA para parsing do currículo` - IA respondeu
- `✅ Mensagem processada com sucesso` - Processamento concluído

#### Listener de Scores:
- `📝 Processando mensagem de score` - Início do processamento
- `⏳ Aguardando resposta do serviço de IA...` - Aguardando IA
- `🚀 Iniciando geração de texto` - Iniciando chamada para IA
- `⏳ Aguardando resposta da API externa...` - Aguardando API externa
- `✅ Resposta recebida da API externa` - API externa respondeu
- `✅ Resposta recebida do serviço de IA` - IA respondeu
- `💾 Atualizando scores no banco de dados...` - Salvando no banco
- `✅ Score processado e atualizado com sucesso` - Processamento concluído

### Status dos Serviços

```python
from consumer.handlers.message_handler import MessageHandler
from consumer.handlers.ai_score_message_handler import AIScoreMessageHandler

# Status do listener de CVs
resume_handler = MessageHandler()
resume_status = resume_handler.get_status()

# Status do listener de scores
score_handler = AIScoreMessageHandler()
score_status = score_handler.get_status()

print("📊 Status dos serviços:")
print(f"   SQS CVs: {resume_status['sqs']}")
print(f"   SQS Scores: {score_status['sqs']}")
print(f"   Database: {resume_status['database']}")
```

## 🔧 Desenvolvimento

### Estrutura de Arquivos

```
ai-service/consumer/
├── main.py                           # Ponto de entrada principal
├── config/
│   └── settings.py                   # Configurações (atualizado)
├── handlers/
│   ├── message_handler.py            # Handler de CVs (existente)
│   └── ai_score_message_handler.py   # Handler de Scores (NOVO)
├── models/
│   └── message.py                    # Modelos de mensagem (atualizado)
└── services/
    └── applications_service.py        # Serviço de applications (existente)
```

### Adicionando Novos Listeners

Para adicionar um terceiro listener:

1. **Criar configuração** em `settings.py`
2. **Criar handler** específico
3. **Adicionar ao main.py** com `asyncio.gather()`

### Exemplo de Extensão

```python
# Em main.py
await asyncio.gather(
    resume_handler.process_messages(),
    score_handler.process_messages(),
    new_handler.process_messages()  # Novo listener
)
```

## 🚨 Tratamento de Erros

### Estratégias Implementadas

- **Retry automático** até limite configurado
- **Validação de mensagens** antes do processamento
- **Logs detalhados** para debugging
- **Fallback** para mensagens com erro
- **Deleção automática** após sucesso

### Cenários de Erro

1. **JSON inválido** → Mensagem deletada
2. **Campos obrigatórios ausentes** → Mensagem deletada
3. **Falha na IA** → Retry até limite
4. **Falha no banco** → Retry até limite
5. **Erro inesperado** → Mensagem deletada

## 📈 Performance

### Processamento Paralelo

- **Dois listeners** funcionam simultaneamente
- **Sem bloqueio** entre diferentes tipos de mensagem
- **Escalabilidade** horizontal (pode adicionar mais listeners)

### Otimizações

- **Batch processing** de mensagens
- **Connection pooling** para banco de dados
- **Async/await** para operações I/O
- **Configurável** timeout e retry

## 🔍 Debugging

### Verificar Conexões

```python
# Status SQS
from consumer.services.sqs_service import SQSService
from consumer.config.settings import settings

sqs_cv = SQSService(settings.get_sqs_config())
sqs_score = SQSService(settings.get_ai_score_sqs_config())

print(f"CVs: {sqs_cv.get_queue_info()}")
print(f"Scores: {sqs_score.get_queue_info()}")
```

### Verificar Banco

```python
from consumer.services.applications_service import applications_service

status = applications_service.get_database_status()
print(f"Database: {status}")
```

### Logs Detalhados

```bash
# Aumentar nível de log
export LOG_LEVEL=DEBUG

# Executar consumer
python main.py
```

## 📝 Notas Importantes

1. **Ordem de execução**: Ambos os listeners iniciam simultaneamente
2. **Independência**: Falha em um não afeta o outro
3. **Configuração**: Cada listener tem suas próprias configurações SQS
4. **Banco compartilhado**: Ambos usam o mesmo banco de dados
5. **IA compartilhada**: Ambos usam o mesmo serviço de IA
6. **Logs unificados**: Todos os logs aparecem no mesmo console

## 🚀 Próximos Passos

### Melhorias Sugeridas

1. **Métricas**: Adicionar Prometheus/Grafana
2. **Health checks**: Endpoints de status
3. **Configuração dinâmica**: Hot reload de configurações
4. **Scaling**: Múltiplas instâncias por listener
5. **Dead letter queues**: Para mensagens com falha persistente

### Integrações

1. **Webhooks**: Notificar sistemas externos
2. **Event streaming**: Kafka/PubSub
3. **Cache**: Redis para dados frequentes
4. **Queue prioritization**: Mensagens com prioridade

## 📚 Documentação Relacionada

- [Exemplo de Uso - Database Update](exemplo_uso_database_update.md)
- [Exemplo de Uso - AI Score Listener](exemplo_uso_ai_score_listener.md)
- [README Principal](../README.md)
- [Docker Compose](../docker-compose.yml)
