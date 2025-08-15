import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './controllers/applications.controller';
import { ApplicationsService } from './services/applications.service';
import { ApplicationStageService } from './services/application-stage.service';
import { CandidateEvaluationService } from './services/candidate-evaluation.service';
import { QuestionResponsesController } from './controllers/question-responses.controller';
import { QuestionResponsesService } from './services/question-responses.service';
import { Application } from './entities/application.entity';
import { ApplicationStageHistory } from './entities/application-stage-history.entity';
import { ApplicationQuestionResponse } from './entities/application-question-response.entity';
import { Job } from '../jobs/entities/job.entity';
import { JobStage } from '../jobs/entities/job-stage.entity';
import { JobQuestion } from '../jobs/entities/job-question.entity';
import { Resume } from '../resumes/entities/resume.entity';
import { ResumeProfessionalExperience } from '../resumes/entities/resume-professional-experience.entity';
import { ResumeAcademicFormation } from '../resumes/entities/resume-academic-formation.entity';
import { ResumeAchievement } from '../resumes/entities/resume-achievement.entity';
import { ResumeLanguage } from '../resumes/entities/resume-language.entity';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationStageHistory,
      ApplicationQuestionResponse,
      Job,
      JobStage,
      JobQuestion,
      Resume,
      ResumeProfessionalExperience,
      ResumeAcademicFormation,
      ResumeAchievement,
      ResumeLanguage,
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [ApplicationsController, QuestionResponsesController],
  providers: [
    ApplicationsService,
    ApplicationStageService,
    CandidateEvaluationService,
    QuestionResponsesService,
  ],
  exports: [
    ApplicationsService,
    ApplicationStageService,
    CandidateEvaluationService,
    QuestionResponsesService,
  ],
})
export class ApplicationsModule {}
