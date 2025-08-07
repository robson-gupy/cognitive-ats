import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';
import { Company } from './src/companies/entities/company.entity';
import { Department } from './src/departments/entities/department.entity';
import { Role } from './src/roles/entities/role.entity';
import { Job } from './src/jobs/entities/job.entity';
import { JobQuestion } from './src/jobs/entities/job-question.entity';
import { JobStage } from './src/jobs/entities/job-stage.entity';
import { JobLog } from './src/jobs/entities/job-log.entity';
import { Application } from './src/jobs/entities/application.entity';
import { ApplicationQuestionResponse } from './src/jobs/entities/application-question-response.entity';
import { ApplicationStageHistory } from './src/jobs/entities/application-stage-history.entity';
import { Resume } from './src/jobs/entities/resume.entity';
import { ResumeProfessionalExperience } from './src/jobs/entities/resume-professional-experience.entity';
import { ResumeAcademicFormation } from './src/jobs/entities/resume-academic-formation.entity';
import { ResumeAchievement } from './src/jobs/entities/resume-achievement.entity';
import { ResumeLanguage } from './src/jobs/entities/resume-language.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'cognitive_ats',
  entities: [
    User, 
    Company, 
    Department, 
    Role, 
    Job, 
    JobQuestion, 
    JobStage, 
    JobLog, 
    Application,
    ApplicationQuestionResponse,
    ApplicationStageHistory,
    Resume,
    ResumeProfessionalExperience,
    ResumeAcademicFormation,
    ResumeAchievement,
    ResumeLanguage,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Desabilitar synchronize em produção
  logging: process.env.NODE_ENV !== 'production',
}); 