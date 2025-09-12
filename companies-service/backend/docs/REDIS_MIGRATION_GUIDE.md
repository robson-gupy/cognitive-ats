# Guia de Migração: SQS para Redis

## Visão Geral

Este guia mostra como migrar do sistema de filas SQS para Redis, aproveitando a abstração criada pela interface `AsyncTaskQueue`.

## Passos para Migração

### 1. Instalar Dependências

As dependências do Redis já foram adicionadas ao `package.json`:

```json
{
  "dependencies": {
    "redis": "^4.6.12"
  }
}
```

### 2. Configurar Variáveis de Ambiente

As seguintes variáveis foram adicionadas aos arquivos de configuração:

```bash
# Redis Connection
REDIS_URL=redis://redis:6379/0

# Redis Queue Names (opcional, usa SQS como fallback)
APPLICATIONS_REDIS_QUEUE_NAME=applications-queue
QUESTION_RESPONSES_REDIS_QUEUE_NAME=question-responses-queue
```

### 3. Trocar o Módulo no SharedModule

Para migrar do SQS para Redis, edite o arquivo `src/shared/shared.module.ts`:

**Antes (SQS):**
```typescript
import { SqsModule } from './services/sqs.module';

@Module({
  imports: [S3Module, SqsModule],
  providers: [AiServiceClient],
  exports: [S3Module, SqsModule, AiServiceClient],
})
export class SharedModule {}
```

**Depois (Redis):**
```typescript
import { RedisModule } from './services/redis.module';

@Module({
  imports: [S3Module, RedisModule],
  providers: [AiServiceClient],
  exports: [S3Module, RedisModule, AiServiceClient],
})
export class SharedModule {}
```

### 4. Verificar Funcionamento

O serviço Redis inclui um método para verificar o status da conexão:

```typescript
// Em qualquer serviço que injete AsyncTaskQueue
const status = await this.asyncTaskQueue.getConnectionStatus();
console.log('Redis Status:', status);
```

## Funcionalidades Implementadas

### RedisTaskQueueService

- ✅ Conexão automática com Redis
- ✅ Reconexão automática em caso de falha
- ✅ Logs detalhados de operações
- ✅ Métodos específicos para aplicações e respostas de questões
- ✅ Verificação de status da conexão
- ✅ Gerenciamento de ciclo de vida (OnModuleInit/OnModuleDestroy)

### Compatibilidade

- ✅ Mantém a mesma interface `AsyncTaskQueue`
- ✅ Usa variáveis de ambiente existentes como fallback
- ✅ Não requer mudanças no código de negócio
- ✅ Logs consistentes com o sistema existente

## Vantagens da Migração

1. **Performance**: Redis é mais rápido que SQS para operações locais
2. **Custo**: Redis é mais barato que SQS para volumes baixos
3. **Controle**: Maior controle sobre a infraestrutura de filas
4. **Desenvolvimento**: Mais fácil para desenvolvimento local
5. **Monitoramento**: Melhor visibilidade do estado das filas

## Monitoramento

### Redis Admin

O sistema já inclui Redis Admin na porta 9090 para monitoramento:

```bash
http://localhost:9090
```

### Logs

O serviço Redis produz logs detalhados:

```
[RedisTaskQueueService] Conectado ao Redis com sucesso
[RedisTaskQueueService] Mensagem enviada para fila Redis applications-queue com sucesso. Tamanho da fila: 5
```

### Status da Conexão

```typescript
const status = await redisService.getConnectionStatus();
// Retorna: { connected: true, queueSizes: { "applications-queue": 5, "question-responses-queue": 2 } }
```

## Rollback

Para voltar ao SQS, simplesmente reverta a mudança no `SharedModule`:

```typescript
import { SqsModule } from './services/sqs.module'; // Volta para SQS
```

## Testes

Os testes existentes continuam funcionando, pois usam a interface `AsyncTaskQueue` que é a mesma para ambas as implementações.

## Próximos Passos

1. Testar em ambiente de desenvolvimento
2. Migrar gradualmente em produção
3. Monitorar performance e logs
4. Considerar implementar retry logic se necessário
5. Avaliar necessidade de dead letter queues
