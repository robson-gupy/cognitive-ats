import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Application } from './application.entity';
import { JobStage } from '../../jobs/entities/job-stage.entity';
import { User } from '../../users/entities/user.entity';

@Entity('application_stage_history')
@Index(['applicationId'])
@Index(['jobId'])
@Index(['companyId'])
@Index(['applicationId', 'createdAt'])
export class ApplicationStageHistory {
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

  @Column({ name: 'from_stage_id', type: 'uuid', nullable: true })
  fromStageId: string;

  @ManyToOne(() => JobStage)
  @JoinColumn({ name: 'from_stage_id' })
  fromStage: JobStage;

  @Column({ name: 'to_stage_id', type: 'uuid' })
  toStageId: string;

  @ManyToOne(() => JobStage)
  @JoinColumn({ name: 'to_stage_id' })
  toStage: JobStage;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
