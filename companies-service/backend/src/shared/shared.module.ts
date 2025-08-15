import { Module } from '@nestjs/common';
import { S3Module } from './services/s3.module';
import { SqsModule } from './services/sqs.module';
import { AiServiceClient } from './ai/ai-service.client';

@Module({
  imports: [S3Module, SqsModule],
  providers: [AiServiceClient],
  exports: [S3Module, SqsModule, AiServiceClient],
})
export class SharedModule {}
