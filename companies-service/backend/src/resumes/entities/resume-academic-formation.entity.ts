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
import { Resume } from './resume.entity';

@Entity('resume_academic_formations')
@Index(['resumeId'])
export class ResumeAcademicFormation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId: string;

  @ManyToOne(() => Resume, (resume) => resume.academicFormations)
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @Column({ name: 'institution', length: 255 })
  institution: string;

  @Column({ name: 'course', length: 255 })
  course: string;

  @Column({ name: 'degree', length: 100 })
  degree: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ name: 'status', length: 50, default: 'completed' })
  status: string; // completed, in_progress, abandoned

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
