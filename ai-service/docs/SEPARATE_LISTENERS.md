# Listeners Separados do AI Service

Este documento explica como usar os dois listeners separados do AI Service no Docker Compose.

## Visão Geral

O AI Service agora possui dois listeners separados que podem ser executados independentemente:

1. **Resume Listener** (`sqs-resume-listener`): Processa mensagens de parse de currículos
2. **Score Listener** (`sqs-score-listener`): Processa mensagens de score de candidatos

## Benefícios da Separação

- **Escalabilidade**: Cada listener pode ser escalado independentemente
- **Isolamento**: Problemas em um listener não afetam o outro
- **Monitoramento**: Logs e métricas separados para cada tipo de processamento
- **Manutenção**: Atualizações e manutenção podem ser feitas independentemente

## Estrutura dos Containers

### Resume Listener
- **Container**: `cognitive-ats-sqs-resume-listener`
- **Dockerfile**: `ai-service/consumer/Dockerfile.resume-listener`
- **Função**: Processa mensagens da fila de currículos para extração de informações
- **Dependências**: LocalStack, Companies Backend, PostgreSQL

### Score Listener
- **Container**: `cognitive-ats-sqs-score-listener`
- **Dockerfile**: `ai-service/consumer/Dockerfile.score-listener`
- **Função**: Processa mensagens da fila de scores para avaliação de candidatos
- **Dependências**: LocalStack, Companies Backend, PostgreSQL

## Comandos Docker Compose

### Iniciar todos os serviços
```bash
docker-compose up -d
```

### Iniciar apenas um listener específico
```bash
# Apenas o listener de parse de currículos
docker-compose up sqs-resume-listener -d

# Apenas o listener de score
docker-compose up sqs-score-listener -d
```

### Parar um listener específico
```bash
# Parar o listener de parse de currículos
docker-compose stop sqs-resume-listener

# Parar o listener de score
docker-compose stop sqs-score-listener
```

### Ver logs de um listener específico
```bash
# Logs em tempo real do resume listener
docker-compose logs -f sqs-resume-listener

# Logs em tempo real do score listener
docker-compose logs -f sqs-score-listener

# Últimas 50 linhas de log
docker-compose logs --tail=50 sqs-resume-listener
docker-compose logs --tail=50 sqs-score-listener
```

### Reiniciar um listener específico
```bash
docker-compose restart sqs-resume-listener
docker-compose restart sqs-score-listener
```

## Monitoramento

### Verificar status dos containers
```bash
# Status de todos os containers
docker-compose ps

# Status específico dos listeners
docker-compose ps sqs-resume-listener sqs-score-listener
```

### Verificar uso de recursos
```bash
# Uso de CPU e memória
docker stats cognitive-ats-sqs-resume-listener cognitive-ats-sqs-score-listener
```

## Scripts de Teste

### Testar listeners separados
```bash
./scripts/test-separate-listeners.sh
```

Este script verifica:
- Status dos containers
- Logs recentes
- Comandos úteis para gerenciamento

## Configuração de Variáveis de Ambiente

### Resume Listener
- `APPLICATIONS_SQS_QUEUE_NAME`: Nome da fila SQS para currículos
- `STORAGE_SERVICE_ENDPOINT`: Endpoint do LocalStack
- `AWS_ACCESS_KEY_ID`: Chave de acesso AWS
- `AWS_SECRET_ACCESS_KEY`: Chave secreta AWS
- `AWS_REGION`: Região AWS
- `OPENAI_API_KEY`: Chave da API OpenAI
- `BACKEND_URL`: URL do backend Companies Service

### Score Listener
- `AI_SCORE_SQS_QUEUE_NAME`: Nome da fila SQS para scores (padrão: `ai-score-queue`)
- `STORAGE_SERVICE_ENDPOINT`: Endpoint do LocalStack
- `AWS_ACCESS_KEY_ID`: Chave de acesso AWS
- `AWS_SECRET_ACCESS_KEY`: Chave secreta AWS
- `AWS_REGION`: Região AWS
- `OPENAI_API_KEY`: Chave da API OpenAI
- `ANTHROPIC_API_KEY`: Chave da API Anthropic
- `BACKEND_URL`: URL do backend Companies Service

## Troubleshooting

### Container não inicia
1. Verificar logs: `docker-compose logs sqs-resume-listener`
2. Verificar dependências: `docker-compose ps`
3. Verificar variáveis de ambiente no arquivo `.env`

### Erro de conexão com banco
1. Verificar se PostgreSQL está rodando: `docker-compose ps postgres`
2. Verificar variáveis de ambiente de banco
3. Verificar conectividade de rede

### Erro de conexão com SQS
1. Verificar se LocalStack está rodando: `docker-compose ps localstack`
2. Verificar variáveis de ambiente AWS
3. Verificar se as filas SQS foram criadas

## Migração do Sistema Anterior

Se você estava usando o sistema anterior com um único listener:

1. **Parar o serviço antigo**:
   ```bash
   docker-compose stop sqs-listener
   ```

2. **Iniciar os novos serviços**:
   ```bash
   docker-compose up sqs-resume-listener sqs-score-listener -d
   ```

3. **Verificar funcionamento**:
   ```bash
   ./scripts/test-separate-listeners.sh
   ```

4. **Remover o serviço antigo** (opcional):
   ```bash
   docker-compose rm sqs-listener
   ```

## Próximos Passos

- [ ] Implementar health checks para cada listener
- [ ] Adicionar métricas de monitoramento
- [ ] Configurar alertas para falhas
- [ ] Implementar auto-scaling baseado em carga
