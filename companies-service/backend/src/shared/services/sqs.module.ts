import { Module } from '@nestjs/common';
import { SqsClientService } from './sqs-client.service';
import { AsyncTaskQueue } from '../interfaces/async-task-queue.interface';

@Module({
  providers: [
    {
      provide: 'AsyncTaskQueue',
      useClass: SqsClientService,
    },
    SqsClientService, // Manter para compatibilidade temporária
  ],
  exports: [
    'AsyncTaskQueue',
    SqsClientService, // Manter para compatibilidade temporária
  ],
})
export class SqsModule {}
