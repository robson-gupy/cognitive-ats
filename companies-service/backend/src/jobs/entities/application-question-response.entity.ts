import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Application } from './application.entity';
import { JobQuestion } from './job-question.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('application_question_responses')
@Index(['applicationId'])
@Index(['jobId'])
@Index(['companyId'])
@Index(['jobQuestionId'])
@Index(['applicationId', 'jobQuestionId'], { unique: true })
export class ApplicationQuestionResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'job_question_id', type: 'uuid' })
  jobQuestionId: string;

  @ManyToOne(() => JobQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_question_id' })
  jobQuestion: JobQuestion;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
