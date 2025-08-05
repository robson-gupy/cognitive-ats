# RabbitMQ Integration

Este documento explica como o RabbitMQ está integrado no projeto para processar eventos de aplicações.

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

### Docker Compose

O RabbitMQ já está configurado no `docker-compose.yml` com:
- Porta 5672 para AMQP
- Porta 15672 para interface web de gerenciamento
- Usuário: `admin`
- Senha: `admin`

## Funcionalidades

### 1. Publicação de Mensagens

Quando uma nova aplicação é criada (com ou sem currículo), uma mensagem é automaticamente enviada para o RabbitMQ com:

- **Routing Key**: `application.new`
- **Exchange**: `applications`
- **Dados**: Todos os dados da aplicação criada

### 2. Estrutura da Mensagem

```json
{
  "event": "application.new",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "id": "uuid-da-aplicacao",
    "jobId": "uuid-da-vaga",
    "companyId": "uuid-da-empresa",
    "email": "candidato@email.com",
    "phone": "+5511999999999",
    "name": "Nome do Candidato",
    "resumeUrl": "https://s3-url-do-curriculo.pdf",
    "aiScore": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Consumo de Mensagens

O projeto inclui um serviço de exemplo (`RabbitMQConsumerService`) que:

- Conecta automaticamente ao RabbitMQ
- Cria uma fila `applications-queue`
- Escuta mensagens com routing key `application.new`
- Processa as mensagens e registra logs

## Como Usar

### 1. Iniciar os Serviços

```bash
docker-compose up -d
```

### 2. Acessar Interface Web

Acesse http://localhost:15672 para gerenciar o RabbitMQ:
- Usuário: `admin`
- Senha: `admin`

### 3. Criar uma Aplicação

Quando você criar uma aplicação via API, a mensagem será automaticamente enviada para o RabbitMQ.

### 4. Verificar Logs

```bash
docker-compose logs companies-backend
```

Você verá logs como:
```
Conectado ao RabbitMQ
Mensagem publicada com routing key: application.new
Nova aplicação recebida: { event: 'application.new', ... }
```

## Implementação Customizada

### Para Adicionar Novos Consumidores

1. Crie um novo serviço similar ao `RabbitMQConsumerService`
2. Implemente a lógica específica no método `processApplicationNew`
3. Registre o serviço no módulo apropriado

### Para Adicionar Novos Eventos

1. Adicione novos métodos no `RabbitMQService`
2. Use routing keys diferentes (ex: `application.updated`, `application.deleted`)
3. Implemente consumidores específicos para cada evento

## Exemplos de Uso

### Envio de Email

```typescript
private async processApplicationNew(message: any) {
  const { data } = message;
  
  // Enviar email de confirmação
  await this.emailService.sendConfirmation(data.email, data.name);
  
  // Notificar recrutadores
  await this.notificationService.notifyRecruiters(data.companyId, data);
}
```

### Processamento com IA

```typescript
private async processApplicationNew(message: any) {
  const { data } = message;
  
  if (data.resumeUrl) {
    // Processar currículo com IA
    const aiScore = await this.aiService.analyzeResume(data.resumeUrl);
    
    // Atualizar score na aplicação
    await this.applicationsService.updateAiScore(data.id, { aiScore });
  }
}
```

## Troubleshooting

### Problemas de Conexão

1. Verifique se o RabbitMQ está rodando: `docker-compose ps`
2. Verifique as variáveis de ambiente
3. Verifique os logs: `docker-compose logs rabbitmq`

### Mensagens Não Processadas

1. Verifique se a fila existe na interface web
2. Verifique se a routing key está correta
3. Verifique os logs do consumidor

### Performance

- As mensagens são persistentes por padrão
- Use múltiplos consumidores para alta carga
- Configure dead letter queues para mensagens com erro 