import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './services/jobs.service';
import { JobsController } from './controllers/jobs.controller';
import { PublicJobsController } from './controllers/public-jobs.controller';
import { Job } from './entities/job.entity';
import { JobQuestion } from './entities/job-question.entity';
import { JobStage } from './entities/job-stage.entity';
import { JobLog } from './entities/job-log.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtConfigModule } from '../auth/jwt.module';
import { CompaniesModule } from '../companies/companies.module';
import { ApplicationsModule } from '../applications/applications.module';
import { ResumesModule } from '../resumes/resumes.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job, 
      JobQuestion, 
      JobStage, 
      JobLog,
    ]),
    AuthModule,
    JwtConfigModule,
    CompaniesModule,
    ApplicationsModule,
    ResumesModule,
    SharedModule,
  ],
  controllers: [JobsController, PublicJobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
