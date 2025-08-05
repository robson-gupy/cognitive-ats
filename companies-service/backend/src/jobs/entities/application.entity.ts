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
import { Job } from './job.entity';
import { Company } from '../../companies/entities/company.entity';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'ai_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiScore: number;
} 