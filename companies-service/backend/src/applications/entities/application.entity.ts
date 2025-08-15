import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { Company } from '../../companies/entities/company.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { ApplicationQuestionResponse } from './application-question-response.entity';
import { JobStage } from '../../jobs/entities/job-stage.entity';
import { ApplicationStageHistory } from './application-stage-history.entity';

@Entity('applications')
@Index(['jobId'])
@Index(['companyId'])
@Index(['jobId', 'companyId'])
@Index(['jobId', 'email'], { unique: true, where: 'email IS NOT NULL' })
@Index(['jobId', 'phone'], { unique: true, where: 'phone IS NOT NULL' })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'first_name', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', length: 255 })
  lastName: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    name: 'ai_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  aiScore: number;

  @Column({
    name: 'overall_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  overallScore: number;

  @Column({
    name: 'question_responses_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  questionResponsesScore: number;

  @Column({
    name: 'education_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  educationScore: number;

  @Column({
    name: 'experience_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  experienceScore: number;

  @Column({
    name: 'evaluation_provider',
    length: 50,
    nullable: true,
  })
  evaluationProvider: string;

  @Column({
    name: 'evaluation_model',
    length: 100,
    nullable: true,
  })
  evaluationModel: string;

  @Column({
    name: 'evaluation_details',
    type: 'jsonb',
    nullable: true,
  })
  evaluationDetails: any;

  @Column({
    name: 'evaluated_at',
    type: 'timestamp',
    nullable: true,
  })
  evaluatedAt: Date;

  @Column({ name: 'resume_url', length: 500, nullable: true })
  resumeUrl: string;

  @Column({ name: 'current_stage_id', type: 'uuid', nullable: true })
  currentStageId: string;

  @ManyToOne(() => JobStage)
  @JoinColumn({ name: 'current_stage_id' })
  currentStage: JobStage;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Resume, (resume) => resume.application, {
    cascade: true,
  })
  resume: Resume;

  @OneToMany(
    () => ApplicationQuestionResponse,
    (response) => response.application,
    {
      cascade: true,
    },
  )
  questionResponses: ApplicationQuestionResponse[];

  @OneToMany(() => ApplicationStageHistory, (history) => history.application, {
    cascade: true,
  })
  stageHistory: ApplicationStageHistory[];
}
