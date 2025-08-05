# Integração com SQS

Este documento descreve a integração com Amazon SQS (Simple Queue Service) para envio de mensagens quando uma application for criada.

## Configuração

### Variáveis de Ambiente

As seguintes variáveis já estão configuradas no `docker-compose.yml`:

```env
# Configurações do SQS
APPLICATIONS_SQS_QUEUE_NAME=applications-queue
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
ENDPOINT_URL=http://localstack:4566
```

### Ambiente Local (LocalStack)

Para desenvolvimento local, o LocalStack já está configurado com uma fila SQS. A fila `applications-queue` é criada automaticamente pelo script `setup-localstack.sh`.

## Funcionalidade

### Envio de Mensagens

Quando uma application é criada através do endpoint `POST /applications` (com resume), uma mensagem é automaticamente enviada para a fila SQS com os seguintes dados:

```json
{
  "applicationId": "uuid-da-application",
  "resumeUrl": "https://bucket.s3.amazonaws.com/resume.pdf",
  "eventType": "APPLICATION_CREATED",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Serviço SQS

O `SqsClientService` fornece os seguintes métodos:

- `sendMessage(queueName: string, messageBody: any)`: Envia uma mensagem genérica para uma fila
- `sendApplicationCreatedMessage(applicationId: string, resumeUrl: string)`: Envia mensagem específica para applications criadas

### Tratamento de Erros

Se houver erro no envio da mensagem para SQS:
- O erro é logado mas não impede a criação da application
- A application é criada normalmente mesmo se o envio da mensagem falhar

## Testes

Execute os testes unitários do SQS service:

```bash
npm run test src/shared/services/sqs-client.service.spec.ts
```

## Monitoramento

As mensagens enviadas são logadas com o seguinte formato:
```
Mensagem enviada para fila applications-queue com sucesso. MessageId: abc123
```

## Consumo das Mensagens

Para consumir as mensagens da fila, você pode usar o AWS SDK ou CLI:

```bash
# Listar mensagens na fila (LocalStack)
aws sqs receive-message \
  --queue-url http://localhost:4566/000000000000/applications-queue \
  --endpoint-url http://localhost:4566

# Ou usando Docker (se estiver rodando em container)
docker run --rm --network cognitive-ats_cognitive-ats-network \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  -e AWS_DEFAULT_REGION=us-east-1 \
  amazon/aws-cli:latest sqs receive-message \
  --queue-url http://localstack:4566/000000000000/applications-queue \
  --endpoint-url http://localstack:4566
```

## Troubleshooting

### Problema de Conectividade

Se você encontrar erros de conectividade como:
```
UnknownEndpoint: Inaccessible host: `localhost' at port `4566'
```

Isso indica que o serviço está tentando conectar em `localhost` em vez do nome do serviço Docker. A correção já foi implementada para usar `localstack:4566` dentro do ambiente Docker.

### Teste de Conectividade

Para testar a conectividade com SQS, execute:

```bash
# Dentro do container do backend
node scripts/test-sqs.js

# Ou via Docker
docker exec cognitive-ats-companies-backend-dev node scripts/test-sqs.js
```

### Verificar Status do LocalStack

```bash
# Verificar se o LocalStack está rodando
docker ps | grep localstack

# Ver logs do LocalStack
docker logs cognitive-ats-localstack

# Verificar filas SQS
docker run --rm --network cognitive-ats_cognitive-ats-network \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  -e AWS_DEFAULT_REGION=us-east-1 \
  amazon/aws-cli:latest sqs list-queues \
  --endpoint-url http://localstack:4566
``` 