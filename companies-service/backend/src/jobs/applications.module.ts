import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { ApplicationStageService } from './application-stage.service';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { Application } from './entities/application.entity';
import { Job } from './entities/job.entity';
import { JobStage } from './entities/job-stage.entity';
import { ApplicationStageHistory } from './entities/application-stage-history.entity';
import { Resume } from './entities/resume.entity';
import { ResumeProfessionalExperience } from './entities/resume-professional-experience.entity';
import { ResumeAcademicFormation } from './entities/resume-academic-formation.entity';
import { ResumeAchievement } from './entities/resume-achievement.entity';
import { ResumeLanguage } from './entities/resume-language.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtConfigModule } from '../auth/jwt.module';
import { S3Module } from '../shared/services/s3.module';
import { SqsModule } from '../shared/services/sqs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application, 
      Job,
      JobStage,
      ApplicationStageHistory,
      Resume,
      ResumeProfessionalExperience,
      ResumeAcademicFormation,
      ResumeAchievement,
      ResumeLanguage,
    ]),
    AuthModule,
    JwtConfigModule,
    S3Module,
    SqsModule,
  ],
  controllers: [ApplicationsController, ResumeController],
  providers: [ApplicationsService, ApplicationStageService, ResumeService],
  exports: [ApplicationsService, ApplicationStageService, ResumeService],
})
export class ApplicationsModule {}
