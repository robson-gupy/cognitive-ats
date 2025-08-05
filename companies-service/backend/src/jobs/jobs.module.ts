import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { JobQuestion } from './entities/job-question.entity';
import { JobStage } from './entities/job-stage.entity';
import { JobLog } from './entities/job-log.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtConfigModule } from '../auth/jwt.module';
import { AiServiceClient } from './ai-service.client';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobQuestion, JobStage, JobLog]),
    AuthModule,
    JwtConfigModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, AiServiceClient],
  exports: [JobsService],
})
export class JobsModule {}
