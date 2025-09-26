import { Module } from '@nestjs/common';
import { S3Module } from './services/s3.module';
import { RedisModule } from './services/redis.module'; // Substitui SqsModule
import { AiServiceClient } from './ai/ai-service.client';

/**
 * Exemplo do SharedModule configurado para usar Redis em vez de SQS
 * 
 * Para migrar do SQS para Redis:
 * 1. Substitua SqsModule por RedisModule nas importações
 * 2. Substitua SqsModule por RedisModule nas exportações
 * 3. Certifique-se de que as variáveis de ambiente Redis estão configuradas
 */
@Module({
  imports: [S3Module, RedisModule], // RedisModule em vez de SqsModule
  providers: [AiServiceClient],
  exports: [S3Module, RedisModule, AiServiceClient], // RedisModule em vez de SqsModule
})
export class SharedModule {}
