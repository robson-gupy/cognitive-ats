# Docker Compose - Variáveis de Ambiente Atualizadas

Este documento descreve as atualizações realizadas no `docker-compose.yml` para incluir todas as variáveis de ambiente necessárias para os novos handlers e funcionalidades.

## Mudanças Realizadas

### 1. AI Service - Novas Variáveis de Avaliação

#### **Antes:**
```yaml
ai-service:
  environment:
    - DEFAULT_AI_PROVIDER=${DEFAULT_AI_PROVIDER}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - DEFAULT_MODEL=${DEFAULT_MODEL:-gpt-4}
    # ... outras variáveis
```

#### **Depois:**
```yaml
ai-service:
  environment:
    - DEFAULT_AI_PROVIDER=${DEFAULT_AI_PROVIDER}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - DEFAULT_MODEL=${DEFAULT_MODEL:-gpt-4}
    # Variáveis para avaliação de candidatos
    - EVALUATION_PROVIDER=${EVALUATION_PROVIDER:-openai}
    - EVALUATION_MODEL=${EVALUATION_MODEL:-gpt-4}
```

### 2. Async Task Consumer - Configuração Completa

#### **Antes:**
```yaml
async-task-consumer:
  environment:
    - REDIS_URL=${REDIS_URL}
    - QUEUES_NAMES=${QUESTION_RESPONSES_QUEUE_NAME},${APPLICATIONS_QUEUE_NAME}
    - QUESTION_RESPONSES_QUEUE_NAME=
    - APPLICATIONS_QUEUE_NAME=
    - AI_SERVICE_URL=${AI_SERVICE_URL}
    # ... configurações incompletas
```

#### **Depois:**
```yaml
async-task-consumer:
  environment:
    # Redis Configuration
    - REDIS_URL=${REDIS_URL}
    # Queue Configuration
    - APPLICATIONS_QUEUE_NAME=${APPLICATIONS_QUEUE_NAME}
    - AI_SCORE_QUEUE_NAME=${AI_SCORE_QUEUE_NAME:-ai-score-queue}
    - QUESTION_RESPONSES_QUEUE_NAME=${QUESTION_RESPONSES_QUEUE_NAME}
    # Storage Configuration
    - STORAGE_SERVICE_ENDPOINT=${STORAGE_SERVICE_ENDPOINT}
    - STORAGE_URL=${STORAGE_SERVICE_ENDPOINT}
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    - AWS_REGION=${AWS_REGION}
    - AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
    - RESUMES_BUCKET_NAME=${RESUMES_BUCKET_NAME}
    # Service URLs
    - AI_SERVICE_URL=${AI_SERVICE_URL}
    - COMPANIES_BACKEND_URL=${COMPANIES_BACKEND_URL:-http://companies-backend:3000}
    - COMPANIES_API_URL=http://companies-backend:3000
    # Evaluation Configuration
    - EVALUATION_PROVIDER=${EVALUATION_PROVIDER:-openai}
    - EVALUATION_MODEL=${EVALUATION_MODEL:-gpt-4}
    # Consumer Configuration
    - LOG_LEVEL=${LOG_LEVEL:-INFO}
    - BLPOP_TIMEOUT_SECONDS=${BLPOP_TIMEOUT_SECONDS:-5}
    - NUM_WORKERS=${NUM_WORKERS:-3}
    - MAX_RETRIES=${MAX_RETRIES:-3}
    - RETRY_BASE_DELAY_SECONDS=${RETRY_BASE_DELAY_SECONDS:-2}
  depends_on:
    - redis
    - ai-service
    - companies-backend
```

## Variáveis de Ambiente por Categoria

### 🔧 **Configuração de Filas (Redis)**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `APPLICATIONS_QUEUE_NAME` | Nome da fila de aplicações | `applications-queue` |
| `AI_SCORE_QUEUE_NAME` | Nome da fila de scores de IA | `ai-score-queue` |
| `QUESTION_RESPONSES_QUEUE_NAME` | Nome da fila de question responses | `question-responses-queue` |

### 🤖 **Configuração de Avaliação (AI Service)**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `EVALUATION_PROVIDER` | Provider de IA para avaliação | `openai` |
| `EVALUATION_MODEL` | Modelo de IA para avaliação | `gpt-4` |

### 💾 **Configuração de Storage (MinIO/S3)**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `STORAGE_SERVICE_ENDPOINT` | Endpoint do serviço de storage | `http://minio:9000` |
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS/MinIO | `minioadmin` |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS/MinIO | `minioadmin` |
| `AWS_REGION` | Região AWS | `us-east-1` |
| `AWS_DEFAULT_REGION` | Região padrão AWS | `us-east-1` |
| `RESUMES_BUCKET_NAME` | Nome do bucket de currículos | `cognitive-ats-uploads` |

### 🌐 **URLs dos Serviços**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `AI_SERVICE_URL` | URL do AI service | `http://ai-service:8000` |
| `COMPANIES_BACKEND_URL` | URL do companies backend | `http://companies-backend:3000` |
| `COMPANIES_API_URL` | URL da API do companies | `http://companies-backend:3000` |

### ⚙️ **Configuração do Consumer**

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `LOG_LEVEL` | Nível de log | `INFO` |
| `BLPOP_TIMEOUT_SECONDS` | Timeout para BLPOP Redis | `5` |
| `NUM_WORKERS` | Número de workers | `3` |
| `MAX_RETRIES` | Máximo de tentativas | `3` |
| `RETRY_BASE_DELAY_SECONDS` | Delay base para retry | `2` |

## Arquivo env.example Atualizado

### Novas Variáveis Adicionadas:

```bash
# =============================================================================
# AI SERVICE - AVALIAÇÃO
# =============================================================================
EVALUATION_PROVIDER=openai
EVALUATION_MODEL=gpt-4

# =============================================================================
# QUEUE CONFIGURATION - FILA DE SCORES
# =============================================================================
AI_SCORE_QUEUE_NAME=ai-score-queue

# =============================================================================
# ASYNC TASK SERVICE - URLS
# =============================================================================
COMPANIES_BACKEND_URL=http://companies-backend:3000
```

## Dependências Atualizadas

### Async Task Consumer
```yaml
depends_on:
  - redis
  - ai-service      # ✅ NOVO - Para chamadas de avaliação
  - companies-backend  # ✅ NOVO - Para atualização de scores
```

## Vantagens das Mudanças

### ✅ **Configuração Completa**
- **Todas as variáveis**: Todas as variáveis necessárias estão configuradas
- **Valores padrão**: Valores padrão sensatos para todas as variáveis
- **Organização**: Variáveis organizadas por categoria com comentários

### ✅ **Flexibilidade**
- **Ambientes diferentes**: Suporte a diferentes ambientes (dev, staging, prod)
- **Configuração dinâmica**: Mudança de configuração sem rebuild
- **Fallbacks**: Valores padrão quando variáveis não estão definidas

### ✅ **Manutenibilidade**
- **Documentação**: Comentários explicando cada seção
- **Padronização**: Mesmo padrão para todas as configurações
- **Centralização**: Todas as configurações em um local

### ✅ **Robustez**
- **Dependências**: Dependências corretas entre serviços
- **Timeouts**: Timeouts configuráveis para operações
- **Retry logic**: Configuração de retry e workers

## Exemplo de Uso

### Desenvolvimento Local
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Configurar variáveis específicas do ambiente
export EVALUATION_PROVIDER=openai
export EVALUATION_MODEL=gpt-4
export AI_SCORE_QUEUE_NAME=dev-ai-score-queue
export QUESTION_RESPONSES_QUEUE_NAME=dev-question-responses-queue

# Executar serviços
docker-compose up -d
```

### Produção
```bash
# Configurar variáveis de produção
export EVALUATION_PROVIDER=openai
export EVALUATION_MODEL=gpt-4-turbo
export AI_SCORE_QUEUE_NAME=prod-ai-score-queue
export QUESTION_RESPONSES_QUEUE_NAME=prod-question-responses-queue
export LOG_LEVEL=WARNING
export NUM_WORKERS=5

# Deploy
docker-compose -f docker-compose.yml up -d
```

## Verificação da Configuração

### Logs de Inicialização
```
INFO - Configurando filas:
INFO -   APPLICATIONS_QUEUE_NAME: applications-queue
INFO -   AI_SCORE_QUEUE_NAME: ai-score-queue
INFO -   QUESTION_RESPONSES_QUEUE_NAME: question-responses-queue

INFO - Configuração de avaliação:
INFO -   EVALUATION_PROVIDER: openai
INFO -   EVALUATION_MODEL: gpt-4

INFO - URLs dos serviços:
INFO -   AI_SERVICE_URL: http://ai-service:8000
INFO -   COMPANIES_BACKEND_URL: http://companies-backend:3000
```

### Health Checks
```bash
# Verificar se todos os serviços estão rodando
docker-compose ps

# Verificar logs do consumer
docker-compose logs async-task-consumer

# Verificar logs do AI service
docker-compose logs ai-service
```

## Troubleshooting

### Problema: Consumer não consegue conectar no AI service
**Solução**: Verificar se `AI_SERVICE_URL` está correto e se o serviço está rodando

### Problema: Filas não são criadas
**Solução**: Verificar se as variáveis de fila estão configuradas corretamente

### Problema: Erro de autenticação AWS/MinIO
**Solução**: Verificar se `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão corretos

### Problema: Consumer não processa mensagens
**Solução**: Verificar se `REDIS_URL` está correto e se Redis está acessível

## Conclusão

As atualizações no docker-compose.yml garantem que:

- ✅ **Todas as variáveis** necessárias estão configuradas
- ✅ **Valores padrão** sensatos para todas as configurações
- ✅ **Dependências** corretas entre serviços
- ✅ **Flexibilidade** para diferentes ambientes
- ✅ **Documentação** clara de todas as configurações

O sistema agora está pronto para executar todos os handlers com as configurações corretas!
