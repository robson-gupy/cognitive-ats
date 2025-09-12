import { Module } from '@nestjs/common';
import { S3Module } from './services/s3.module';
import { AiServiceClient } from './ai/ai-service.client';
import { RedisModule } from './services/redis.module';

@Module({
  imports: [S3Module, RedisModule],
  providers: [AiServiceClient],
  exports: [S3Module, RedisModule, AiServiceClient],
})
export class SharedModule {}
