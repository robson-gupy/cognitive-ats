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

@Entity('resume_languages')
@Index(['resumeId'])
export class ResumeLanguage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId: string;

  @ManyToOne(() => Resume, (resume) => resume.languages)
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @Column({ name: 'language', length: 100 })
  language: string;

  @Column({ name: 'proficiency_level', length: 50 })
  proficiencyLevel: string; // basic, intermediate, advanced, fluent, native

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
