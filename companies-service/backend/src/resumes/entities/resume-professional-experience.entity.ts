import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Resume } from './resume.entity';

@Entity('resume_professional_experiences')
@Index(['resumeId'])
export class ResumeProfessionalExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId: string;

  @ManyToOne(() => Resume, (resume) => resume.professionalExperiences)
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @Column({ name: 'company_name', length: 255 })
  companyName: string;

  @Column({ name: 'position', length: 255 })
  position: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_current', type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'responsibilities', type: 'text', nullable: true })
  responsibilities: string;

  @Column({ name: 'achievements', type: 'text', nullable: true })
  achievements: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
