# Resumo das Mudanças - Listeners Separados

## O que foi implementado

Este documento resume as mudanças realizadas para separar os dois listeners do AI Service em containers Docker independentes.

## Arquivos Criados/Modificados

### 1. Dockerfiles Separados
- **`ai-service/consumer/Dockerfile.resume-listener`**: Container para parse de currículos
- **`ai-service/consumer/Dockerfile.score-listener`**: Container para score de candidatos

### 2. Docker Compose Atualizado
- **`docker-compose.yml`**: Substituído o serviço `sqs-listener` por dois serviços separados:
  - `sqs-resume-listener`: Processa mensagens de currículos
  - `sqs-score-listener`: Processa mensagens de scores

### 3. Scripts de Gerenciamento
- **`scripts/test-separate-listeners.sh`**: Script para testar e monitorar os listeners
- **`scripts/migrate-to-separate-listeners.sh`**: Script para migrar do sistema anterior

### 4. Documentação
- **`docs/SEPARATE_LISTENERS.md`**: Documentação completa de uso
- **`docs/SEPARATE_LISTENERS_SUMMARY.md`**: Este resumo

### 5. Configurações de Ambiente
- **`ai-service/consumer/env.consumer.example`**: Adicionada configuração `APPLICATIONS_AI_SCORE_SQS_QUEUE_NAME`
- **`config/env.example`**: Adicionada configuração da fila AI Score SQS

## Estrutura dos Novos Serviços

### Resume Listener (Parse de currículos)
```yaml
sqs-resume-listener:
  build:
    context: ./ai-service
    dockerfile: consumer/Dockerfile.resume-listener
  container_name: cognitive-ats-sqs-resume-listener
  environment:
    - APPLICATIONS_SQS_QUEUE_NAME=${APPLICATIONS_SQS_QUEUE_NAME}
    - STORAGE_SERVICE_ENDPOINT=${STORAGE_SERVICE_ENDPOINT}
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    - AWS_REGION=${AWS_REGION}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - BACKEND_URL=${BACKEND_URL}
    - POSTGRES_DB=${POSTGRES_DB}
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - POSTGRES_HOST=${DB_HOST}
    - POSTGRES_PORT=${DB_PORT}
```

### Score Listener (Score de candidatos)
```yaml
sqs-score-listener:
  build:
    context: ./ai-service
    dockerfile: consumer/Dockerfile.score-listener
  container_name: cognitive-ats-sqs-score-listener
  environment:
    - AI_SCORE_SQS_QUEUE_NAME=${AI_SCORE_SQS_QUEUE_NAME:-ai-score-queue}
    - STORAGE_SERVICE_ENDPOINT=${STORAGE_SERVICE_ENDPOINT}
    - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
    - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    - AWS_REGION=${AWS_REGION}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - BACKEND_URL=${BACKEND_URL}
    - POSTGRES_DB=${POSTGRES_DB}
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - POSTGRES_HOST=${DB_HOST}
    - POSTGRES_PORT=${DB_PORT}
```

## Benefícios da Separação

### ✅ Escalabilidade
- Cada listener pode ser escalado independentemente
- Possibilidade de ajustar recursos por tipo de processamento

### ✅ Isolamento
- Problemas em um listener não afetam o outro
- Falhas isoladas por tipo de funcionalidade

### ✅ Monitoramento
- Logs separados para cada tipo de processamento
- Métricas independentes para análise de performance

### ✅ Manutenção
- Atualizações podem ser feitas independentemente
- Rollbacks seletivos por funcionalidade

### ✅ Recursos
- Alocação de CPU/memória específica por listener
- Configurações de rede independentes

## Como Usar

### 1. Iniciar todos os serviços
```bash
docker-compose up -d
```

### 2. Iniciar apenas um listener
```bash
# Apenas parse de currículos
docker-compose up sqs-resume-listener -d

# Apenas score de candidatos
docker-compose up sqs-score-listener -d
```

### 3. Monitorar logs
```bash
# Logs em tempo real
docker-compose logs -f sqs-resume-listener
docker-compose logs -f sqs-score-listener

# Últimas linhas
docker-compose logs --tail=50 sqs-resume-listener
```

### 4. Gerenciar serviços
```bash
# Parar um serviço
docker-compose stop sqs-resume-listener

# Reiniciar um serviço
docker-compose restart sqs-score-listener

# Ver status
docker-compose ps sqs-resume-listener sqs-score-listener
```

## Migração do Sistema Anterior

### Script Automático
```bash
./scripts/migrate-to-separate-listeners.sh
```

### Migração Manual
1. Parar o serviço antigo: `docker-compose stop sqs-listener`
2. Remover o serviço antigo: `docker-compose rm sqs-listener`
3. Iniciar os novos serviços: `docker-compose up sqs-resume-listener sqs-score-listener -d`

## Variáveis de Ambiente

### Resume Listener
- `APPLICATIONS_SQS_QUEUE_NAME`: Fila para currículos
- `STORAGE_SERVICE_ENDPOINT`: Endpoint LocalStack
- `AWS_ACCESS_KEY_ID`: Chave AWS
- `AWS_SECRET_ACCESS_KEY`: Chave secreta AWS
- `AWS_REGION`: Região AWS
- `OPENAI_API_KEY`: Chave OpenAI
- `BACKEND_URL`: URL do backend
- Variáveis de banco PostgreSQL

### Score Listener
- `AI_SCORE_SQS_QUEUE_NAME`: Fila para scores (padrão: `ai-score-queue`)
- `STORAGE_SERVICE_ENDPOINT`: Endpoint LocalStack
- `AWS_ACCESS_KEY_ID`: Chave AWS
- `AWS_SECRET_ACCESS_KEY`: Chave secreta AWS
- `AWS_REGION`: Região AWS
- `OPENAI_API_KEY`: Chave OpenAI
- `ANTHROPIC_API_KEY`: Chave Anthropic
- `BACKEND_URL`: URL do backend
- Variáveis de banco PostgreSQL

## Próximos Passos Recomendados

1. **Testar funcionamento** dos novos serviços
2. **Monitorar performance** de cada listener separadamente
3. **Implementar health checks** para cada container
4. **Configurar alertas** para falhas específicas
5. **Implementar auto-scaling** baseado em carga
6. **Adicionar métricas** de monitoramento detalhadas

## Troubleshooting

### Container não inicia
- Verificar logs: `docker-compose logs sqs-resume-listener`
- Verificar dependências: `docker-compose ps`
- Verificar variáveis de ambiente no `.env`

### Erro de conexão
- Verificar se LocalStack está rodando
- Verificar se PostgreSQL está disponível
- Verificar configurações de rede

### Performance
- Monitorar uso de recursos: `docker stats`
- Verificar logs de processamento
- Ajustar configurações de SQS se necessário
