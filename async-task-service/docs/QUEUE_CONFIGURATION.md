# Configuração de Filas - Async Task Service

Este documento descreve as variáveis de ambiente utilizadas para configurar os nomes das filas no async-task-service.

## Variáveis de Ambiente

### APPLICATIONS_QUEUE_NAME
- **Descrição**: Nome da fila para processamento de aplicações criadas
- **Valor Padrão**: `applications-queue`
- **Handler**: `handler_application_created`
- **Evento**: `APPLICATION_CREATED`

**Exemplo:**
```bash
export APPLICATIONS_QUEUE_NAME="applications-queue"
```

### AI_SCORE_QUEUE_NAME
- **Descrição**: Nome da fila para processamento de scores de IA
- **Valor Padrão**: `ai-score-queue`
- **Handler**: `handler_ai_score`
- **Evento**: `AI_SCORE_CALCULATION`

**Exemplo:**
```bash
export AI_SCORE_QUEUE_NAME="ai-score-queue"
```

### QUESTION_RESPONSES_QUEUE_NAME
- **Descrição**: Nome da fila para processamento de question responses
- **Valor Padrão**: `question-responses-queue`
- **Handler**: `handler_question_responses`
- **Evento**: `MULTIPLE_QUESTION_RESPONSES_CREATED`

**Exemplo:**
```bash
export QUESTION_RESPONSES_QUEUE_NAME="question-responses-queue"
```

## Configuração no Código

### handler_settings.py

```python
import os
from handlers.applications import handler_application_created
from handlers.ai_score import handler_ai_score
from handlers.question_responses import handler_question_responses

# Mapeamento de filas para handlers
QUEUE_HANDLERS = {
    os.getenv('APPLICATIONS_QUEUE_NAME', 'applications-queue'): handler_application_created,
    os.getenv('AI_SCORE_QUEUE_NAME', 'ai-score-queue'): handler_ai_score,
    os.getenv('QUESTION_RESPONSES_QUEUE_NAME', 'question-responses-queue'): handler_question_responses,
}

# Configuração das filas que serão consumidas
QUEUES_NAMES = QUEUE_HANDLERS.keys()
```

## Exemplo de Arquivo .env

```bash
# Configuração de Filas
APPLICATIONS_QUEUE_NAME=applications-queue
AI_SCORE_QUEUE_NAME=ai-score-queue
QUESTION_RESPONSES_QUEUE_NAME=question-responses-queue

# Outras configurações
AI_SERVICE_URL=http://ai-service:8000
COMPANIES_BACKEND_URL=http://companies-backend:3000
```

## Docker Compose

```yaml
services:
  async-task-service:
    environment:
      - APPLICATIONS_QUEUE_NAME=applications-queue
      - AI_SCORE_QUEUE_NAME=ai-score-queue
      - QUESTION_RESPONSES_QUEUE_NAME=question-responses-queue
      - AI_SERVICE_URL=http://ai-service:8000
      - COMPANIES_BACKEND_URL=http://companies-backend:3000
```

## Vantagens da Configuração via Variáveis de Ambiente

### ✅ **Flexibilidade**
- **Ambientes Diferentes**: Nomes diferentes para dev, staging, prod
- **Configuração Dinâmica**: Mudança sem rebuild da aplicação
- **Isolamento**: Filas separadas por ambiente

### ✅ **Manutenibilidade**
- **Centralização**: Configuração em um local
- **Padronização**: Mesmo padrão para todas as filas
- **Documentação**: Fácil identificação das configurações

### ✅ **Segurança**
- **Separação**: Filas isoladas por ambiente
- **Controle**: Controle granular de acesso
- **Auditoria**: Rastreamento de configurações

## Exemplos de Uso

### Desenvolvimento Local
```bash
# Usar nomes padrão
APPLICATIONS_QUEUE_NAME=applications-queue-dev
AI_SCORE_QUEUE_NAME=ai-score-queue-dev
QUESTION_RESPONSES_QUEUE_NAME=question-responses-queue-dev
```

### Staging
```bash
# Usar prefixo staging
APPLICATIONS_QUEUE_NAME=staging-applications-queue
AI_SCORE_QUEUE_NAME=staging-ai-score-queue
QUESTION_RESPONSES_QUEUE_NAME=staging-question-responses-queue
```

### Produção
```bash
# Usar nomes de produção
APPLICATIONS_QUEUE_NAME=prod-applications-queue
AI_SCORE_QUEUE_NAME=prod-ai-score-queue
QUESTION_RESPONSES_QUEUE_NAME=prod-question-responses-queue
```

## Monitoramento

### Logs de Inicialização
```
INFO - Configurando filas:
INFO -   APPLICATIONS_QUEUE_NAME: applications-queue
INFO -   AI_SCORE_QUEUE_NAME: ai-score-queue
INFO -   QUESTION_RESPONSES_QUEUE_NAME: question-responses-queue
```

### Verificação de Configuração
```python
import os

def print_queue_config():
    """Imprime configuração atual das filas"""
    queues = {
        'APPLICATIONS_QUEUE_NAME': os.getenv('APPLICATIONS_QUEUE_NAME', 'applications-queue'),
        'AI_SCORE_QUEUE_NAME': os.getenv('AI_SCORE_QUEUE_NAME', 'ai-score-queue'),
        'QUESTION_RESPONSES_QUEUE_NAME': os.getenv('QUESTION_RESPONSES_QUEUE_NAME', 'question-responses-queue'),
    }
    
    print("📋 Configuração de Filas:")
    for env_var, queue_name in queues.items():
        print(f"   {env_var}: {queue_name}")
```

## Troubleshooting

### Problema: Handler não está sendo chamado
**Solução**: Verificar se o nome da fila está correto na variável de ambiente

### Problema: Mensagens não são processadas
**Solução**: Verificar se a fila existe e se o nome está configurado corretamente

### Problema: Múltiplos ambientes usando a mesma fila
**Solução**: Usar nomes diferentes para cada ambiente

## Migração

### Antes (Hardcoded)
```python
QUEUE_HANDLERS = {
    "applications-queue": handler_application_created,  # ❌ Hardcoded
    "ai-score-queue": handler_ai_score,                # ❌ Hardcoded
    "question-responses-queue": handler_question_responses,  # ❌ Hardcoded
}
```

### Depois (Variáveis de Ambiente)
```python
QUEUE_HANDLERS = {
    os.getenv('APPLICATIONS_QUEUE_NAME', 'applications-queue'): handler_application_created,  # ✅ Configurável
    os.getenv('AI_SCORE_QUEUE_NAME', 'ai-score-queue'): handler_ai_score,                    # ✅ Configurável
    os.getenv('QUESTION_RESPONSES_QUEUE_NAME', 'question-responses-queue'): handler_question_responses,  # ✅ Configurável
}
```

## Conclusão

A configuração via variáveis de ambiente torna o sistema mais flexível e maintível, permitindo:
- **Configuração por ambiente** sem rebuild
- **Isolamento de filas** por ambiente
- **Facilidade de manutenção** e deploy
- **Padronização** de configurações
