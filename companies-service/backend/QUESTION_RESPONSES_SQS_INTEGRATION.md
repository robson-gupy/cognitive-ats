# Integração SQS para Respostas das Perguntas

Este documento descreve a integração com Amazon SQS (Simple Queue Service) para envio de eventos quando respostas das perguntas da vaga forem criadas, atualizadas ou removidas.

## Configuração

### Variáveis de Ambiente

Adicione a seguinte variável ao seu arquivo `.env`:

```env
# Configurações do SQS para respostas das perguntas
QUESTION_RESPONSES_SQS_QUEUE_NAME=question-responses-queue
```

### Ambiente Local (LocalStack)

Para desenvolvimento local, o LocalStack já está configurado para criar automaticamente a fila `question-responses-queue` através do script `setup-localstack.sh`.

## Funcionalidade

### Eventos Emitidos

#### 1. QUESTION_RESPONSE_CREATED
Emitido quando uma resposta individual de pergunta é criada ou atualizada.

**Estrutura da Mensagem:**
```json
{
  "eventType": "QUESTION_RESPONSE_CREATED",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "questionResponseId": "uuid-da-resposta",
    "applicationId": "uuid-da-application",
    "jobId": "uuid-da-vaga",
    "companyId": "uuid-da-empresa",
    "jobQuestionId": "uuid-da-pergunta",
    "question": "Texto da pergunta",
    "answer": "Resposta do candidato",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "job": {
    "id": "uuid-da-vaga",
    "title": "Título da Vaga",
    "slug": "slug-da-vaga",
    "description": "Descrição da vaga",
    "requirements": "Requisitos da vaga"
  },
  "company": {
    "id": "uuid-da-empresa",
    "name": "Nome da Empresa",
    "slug": "slug-da-empresa"
  },
  "application": {
    "id": "uuid-da-application",
    "firstName": "Nome do Candidato",
    "lastName": "Sobrenome do Candidato",
    "email": "email@candidato.com",
    "phone": "(11) 99999-9999",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 2. MULTIPLE_QUESTION_RESPONSES_CREATED
Emitido quando múltiplas respostas de perguntas são criadas de uma vez (cenário mais comum).

**Estrutura da Mensagem:**
```json
{
  "eventType": "MULTIPLE_QUESTION_RESPONSES_CREATED",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "totalResponses": 5,
    "responses": [
      {
        "questionResponseId": "uuid-resposta-1",
        "jobQuestionId": "uuid-pergunta-1",
        "question": "Qual sua experiência com Python?",
        "answer": "Programo em Python há 10 anos",
        "createdAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "questionResponseId": "uuid-resposta-2",
        "jobQuestionId": "uuid-pergunta-2",
        "question": "Quais frameworks conhece?",
        "answer": "Django, Flask, FastAPI",
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "applicationId": "uuid-da-application",
    "jobId": "uuid-da-vaga",
    "companyId": "uuid-da-empresa"
  },
  "job": {
    "id": "uuid-da-vaga",
    "title": "Desenvolvedor Python",
    "slug": "desenvolvedor-python",
    "description": "Descrição da vaga",
    "requirements": "Requisitos da vaga"
  },
  "company": {
    "id": "uuid-da-empresa",
    "name": "TechCorp",
    "slug": "techcorp"
  },
  "application": {
    "id": "uuid-da-application",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Casos de Uso

### 1. Processamento de IA
- **Análise de Respostas**: Usar IA para avaliar a qualidade das respostas
- **Scoring Automático**: Calcular pontuação baseada no conteúdo das respostas
- **Análise de Sentimento**: Avaliar o tom e entusiasmo do candidato

### 2. Notificações
- **Email para Recrutadores**: Notificar quando candidatos respondem perguntas
- **Slack/Teams**: Integração com ferramentas de comunicação
- **Webhooks**: Enviar dados para sistemas externos

### 3. Analytics
- **Métricas de Engajamento**: Rastrear quantos candidatos respondem perguntas
- **Análise de Performance**: Correlacionar respostas com sucesso na contratação
- **Relatórios**: Gerar insights sobre o processo de recrutamento

## Implementação

### Serviço QuestionResponsesService

O serviço foi atualizado para emitir eventos automaticamente:

```typescript
@Injectable()
export class QuestionResponsesService {
  constructor(
    // ... outros repositórios
    private sqsClientService: SqsClientService,
  ) {}

  async createMultiple(
    applicationId: string,
    createMultipleQuestionResponsesDto: CreateMultipleQuestionResponsesDto,
  ): Promise<ApplicationQuestionResponse[]> {
    // ... lógica de criação
    
    const savedResponses = await this.questionResponseRepository.save(questionResponses);

    // Emitir evento para a fila SQS
    try {
      await this.emitMultipleQuestionResponsesEvent(savedResponses, application);
    } catch (error) {
      // Log do erro mas não falhar a operação principal
      console.error('Erro ao emitir evento SQS:', error);
    }

    return savedResponses;
  }
}
```

### Tratamento de Erros

- **Falha no SQS**: Não impede a operação principal (criação/atualização das respostas)
- **Logs de Erro**: Todos os erros são logados para debugging
- **Retry**: O SQS Client Service já possui mecanismos de retry

## Consumo das Mensagens

### Exemplo de Consumidor Python

```python
import boto3
import json
import os

# Configurar cliente SQS
sqs = boto3.client('sqs',
    endpoint_url=os.getenv('ENDPOINT_URL'),  # Para LocalStack
    region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

queue_url = f"http://localhost:4566/000000000000/{os.getenv('QUESTION_RESPONSES_SQS_QUEUE_NAME')}"

def process_question_response_message(message_body):
    """Processa mensagem de resposta de pergunta"""
    data = json.loads(message_body)
    
    if data['eventType'] == 'MULTIPLE_QUESTION_RESPONSES_CREATED':
        print(f"Processando {data['data']['totalResponses']} respostas")
        
        for response in data['data']['responses']:
            print(f"Pergunta: {response['question']}")
            print(f"Resposta: {response['answer']}")
            
        # Aqui você pode implementar sua lógica de processamento
        # Por exemplo: análise de IA, notificações, etc.
    
    elif data['eventType'] == 'QUESTION_RESPONSE_CREATED':
        print(f"Resposta individual: {data['data']['answer']}")

# Loop principal de consumo
while True:
    response = sqs.receive_message(
        QueueUrl=queue_url,
        MaxNumberOfMessages=10,
        WaitTimeSeconds=20
    )
    
    if 'Messages' in response:
        for message in response['Messages']:
            try:
                process_question_response_message(message['Body'])
                
                # Deletar mensagem após processamento
                sqs.delete_message(
                    QueueUrl=queue_url,
                    ReceiptHandle=message['ReceiptHandle']
                )
                
            except Exception as e:
                print(f"Erro ao processar mensagem: {e}")
                # Implementar lógica de retry ou dead letter queue
```

### Exemplo de Consumidor Node.js

```typescript
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({
  endpoint: process.env.ENDPOINT_URL, // Para LocalStack
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function processQuestionResponseMessage(messageBody: string) {
  const data = JSON.parse(messageBody);
  
  if (data.eventType === 'MULTIPLE_QUESTION_RESPONSES_CREATED') {
    console.log(`Processando ${data.data.totalResponses} respostas`);
    
    for (const response of data.data.responses) {
      console.log(`Pergunta: ${response.question}`);
      console.log(`Resposta: ${response.answer}`);
    }
    
    // Implementar sua lógica de processamento aqui
  }
}

async function consumeMessages() {
  const command = new ReceiveMessageCommand({
    QueueUrl: `http://localhost:4566/000000000000/${process.env.QUESTION_RESPONSES_SQS_QUEUE_NAME}`,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
  });

  try {
    const response = await sqsClient.send(command);
    
    if (response.Messages) {
      for (const message of response.Messages) {
        try {
          await processQuestionResponseMessage(message.Body!);
          
          // Deletar mensagem após processamento
          await sqsClient.send(new DeleteMessageCommand({
            QueueUrl: `http://localhost:4566/000000000000/${process.env.QUESTION_RESPONSES_SQS_QUEUE_NAME}`,
            ReceiptHandle: message.ReceiptHandle!,
          }));
          
        } catch (error) {
          console.error('Erro ao processar mensagem:', error);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao receber mensagens:', error);
  }
}

// Loop principal
setInterval(consumeMessages, 1000);
```

## Testes

### Executar Testes Unitários

```bash
# Teste específico do QuestionResponsesService
npm test src/applications/services/question-responses.service.spec.ts

# Todos os testes
npm test
```

### Testar Integração SQS

```bash
# Executar script de setup do LocalStack
./scripts/setup-localstack.sh

# Testar envio de mensagens
node scripts/test-sqs.js
```

## Monitoramento

### Logs

As mensagens enviadas são logadas com o seguinte formato:
```
Mensagem enviada para fila question-responses-queue com sucesso. MessageId: abc123
```

### Métricas

- **Mensagens Enviadas**: Contador de eventos emitidos
- **Tamanho das Mensagens**: Monitorar tamanho das mensagens SQS
- **Latência**: Tempo entre criação da resposta e envio do evento

## Melhorias Futuras

### Funcionalidades Planejadas
- **Dead Letter Queue**: Para mensagens que falharam no processamento
- **Batch Processing**: Processar múltiplas mensagens de uma vez
- **Retry Policies**: Políticas de retry configuráveis
- **Message Filtering**: Filtrar mensagens por tipo de evento

### Otimizações
- **Compressão**: Comprimir mensagens grandes
- **Caching**: Cache de dados frequentemente acessados
- **Async Processing**: Processamento assíncrono de eventos
- **Monitoring**: Dashboards de monitoramento em tempo real

## Suporte

Para dúvidas ou problemas com esta funcionalidade, consulte:
- Documentação da API do companies-service
- Logs do sistema
- Testes automatizados
- Issues do repositório
