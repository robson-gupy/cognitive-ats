import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PublicJobsController } from './public-jobs.controller';
import { Job } from './entities/job.entity';
import { JobQuestion } from './entities/job-question.entity';
import { JobStage } from './entities/job-stage.entity';
import { JobLog } from './entities/job-log.entity';
import { Resume } from './entities/resume.entity';
import { ResumeProfessionalExperience } from './entities/resume-professional-experience.entity';
import { ResumeAcademicFormation } from './entities/resume-academic-formation.entity';
import { ResumeAchievement } from './entities/resume-achievement.entity';
import { ResumeLanguage } from './entities/resume-language.entity';
import { Application } from './entities/application.entity';
import { ApplicationQuestionResponse } from './entities/application-question-response.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtConfigModule } from '../auth/jwt.module';
import { CompaniesModule } from '../companies/companies.module';
import { AiServiceClient } from './ai-service.client';
import { CandidateEvaluationService } from './candidate-evaluation.service';
import { ApplicationsModule } from './applications.module';
import { QuestionResponsesModule } from './question-responses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job, 
      JobQuestion, 
      JobStage, 
      JobLog,
      Resume,
      ResumeProfessionalExperience,
      ResumeAcademicFormation,
      ResumeAchievement,
      ResumeLanguage,
      Application,
      ApplicationQuestionResponse,
    ]),
    AuthModule,
    JwtConfigModule,
    CompaniesModule,
    ApplicationsModule,
    QuestionResponsesModule,
  ],
  controllers: [JobsController, PublicJobsController],
  providers: [JobsService, AiServiceClient, CandidateEvaluationService],
  exports: [JobsService, CandidateEvaluationService],
})
export class JobsModule {}
