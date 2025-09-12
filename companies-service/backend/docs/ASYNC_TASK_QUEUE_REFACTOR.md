# Refatoração do Sistema de Filas - Abstração de Tecnologia

## Visão Geral

Esta refatoração implementa o padrão de inversão de dependência para o sistema de filas, permitindo que as regras de negócio não dependam diretamente da tecnologia específica de fila (SQS, Redis, RabbitMQ, etc.).

## Problema Resolvido

Anteriormente, o `SqsClientService` estava acoplado diretamente às regras de negócio, fazendo com que qualquer mudança na tecnologia de fila requeresse alterações em múltiplos serviços.

## Solução Implementada

### 1. Interface Genérica

Criada a interface `AsyncTaskQueue` em `src/shared/interfaces/async-task-queue.interface.ts`:

```typescript
export interface AsyncTaskQueue {
  sendMessage(queueName: string, messageBody: Record<string, unknown>): Promise<void>;
  sendApplicationCreatedMessage(applicationId: string, resumeUrl: string): Promise<void>;
  sendQuestionResponseMessage(applicationId: string, questionId: string, response: string): Promise<void>;
}
```

### 2. Implementação Atual (SQS)

O `SqsClientService` agora implementa a interface `AsyncTaskQueue`, mantendo toda a funcionalidade existente mas seguindo o contrato da interface.

### 3. Injeção de Dependência

O módulo `SqsModule` foi atualizado para fornecer a interface através do token `'AsyncTaskQueue'`:

```typescript
@Module({
  providers: [
    {
      provide: 'AsyncTaskQueue',
      useClass: SqsClientService,
    },
  ],
  exports: ['AsyncTaskQueue'],
})
export class SqsModule {}
```

### 4. Uso nos Serviços

Os serviços agora dependem da interface em vez da implementação concreta:

```typescript
constructor(
  @Inject('AsyncTaskQueue')
  private asyncTaskQueue: AsyncTaskQueue,
) {}
```

## Benefícios

1. **Desacoplamento**: As regras de negócio não conhecem a tecnologia de fila
2. **Flexibilidade**: Fácil troca entre diferentes tecnologias de fila
3. **Testabilidade**: Possibilidade de mockar a interface nos testes
4. **Manutenibilidade**: Mudanças na implementação não afetam as regras de negócio

## Como Trocar a Tecnologia de Fila

Para trocar de SQS para Redis (ou outra tecnologia), basta:

1. Criar uma nova implementação da interface `AsyncTaskQueue`
2. Atualizar o provider no módulo:

```typescript
{
  provide: 'AsyncTaskQueue',
  useClass: RedisTaskQueueService, // Nova implementação
}
```

## Exemplo de Implementação Alternativa

Um exemplo de implementação usando Redis foi criado em `src/shared/services/redis-task-queue.service.ts` para demonstrar a facilidade de troca.

## Compatibilidade

- A implementação atual mantém compatibilidade com o código existente
- O `SqsClientService` ainda está disponível diretamente para migração gradual
- Todos os testes existentes continuam funcionando

## Próximos Passos

1. Migrar todos os usos diretos do `SqsClientService` para a interface
2. Remover a exportação direta do `SqsClientService` do módulo
3. Considerar implementações alternativas conforme necessário
