import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeController } from './controllers/resume.controller';
import { ResumeService } from './services/resume.service';
import { Resume } from './entities/resume.entity';
import { ResumeProfessionalExperience } from './entities/resume-professional-experience.entity';
import { ResumeAcademicFormation } from './entities/resume-academic-formation.entity';
import { ResumeAchievement } from './entities/resume-achievement.entity';
import { ResumeLanguage } from './entities/resume-language.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationsModule } from '../applications/applications.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resume,
      ResumeProfessionalExperience,
      ResumeAcademicFormation,
      ResumeAchievement,
      ResumeLanguage,
      Application,
    ]),
    ApplicationsModule,
    SharedModule,
  ],
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumesModule {}
