import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';
import { JobQuestion } from './job-question.entity';
import { JobStage } from './job-stage.entity';
import { JobLog } from './job-log.entity';
import { Application } from '../../applications/entities/application.entity';

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  PAUSED = 'PAUSED',
}

@Entity('jobs')
@Index(['companyId'])
@Index(['status'])
@Index(['companyId', 'publishedAt'])
@Index(['companyId', 'closedAt'])
@Index(['companyId', 'status'])
@Index(['companyId', 'departmentId'])
@Index(['companyId', 'status', 'publishedAt'])
@Index(['slug'], { unique: true })
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  requirements: string;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: Date;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status: JobStatus;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, (user) => user.createdJobs)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ length: 500, unique: true })
  slug: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => JobQuestion, (question) => question.job, { cascade: true })
  questions: JobQuestion[];

  @OneToMany(() => JobStage, (stage) => stage.job, { cascade: true })
  stages: JobStage[];

  @OneToMany(() => JobLog, (log) => log.job)
  logs: JobLog[];

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];

  @Column({ name: 'requires_address', type: 'boolean', default: false })
  requiresAddress: boolean;

  @Column({ 
    name: 'search_embedding', 
    type: 'text', 
    nullable: true,
    comment: 'Vetor de embedding para busca semântica combinando title, description e department name'
  })
  searchEmbedding: string;
}
