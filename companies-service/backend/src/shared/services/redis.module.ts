import { Module } from '@nestjs/common';
import { RedisTaskQueueService } from './redis-task-queue.service';
import { AsyncTaskQueue } from '../interfaces/async-task-queue.interface';

@Module({
  providers: [
    {
      provide: 'AsyncTaskQueue',
      useClass: RedisTaskQueueService,
    },
    RedisTaskQueueService, // Manter para compatibilidade e testes
  ],
  exports: [
    'AsyncTaskQueue',
    RedisTaskQueueService, // Manter para compatibilidade e testes
  ],
})
export class RedisModule {}
