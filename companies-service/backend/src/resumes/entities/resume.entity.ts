import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Application } from '../../applications/entities/application.entity';
import { ResumeProfessionalExperience } from './resume-professional-experience.entity';
import { ResumeAcademicFormation } from './resume-academic-formation.entity';
import { ResumeAchievement } from './resume-achievement.entity';
import { ResumeLanguage } from './resume-language.entity';

@Entity('resumes')
@Index(['applicationId'], { unique: true })
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @OneToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary: string;

  @OneToMany(
    () => ResumeProfessionalExperience,
    (experience) => experience.resume,
    {
      cascade: true,
    },
  )
  professionalExperiences: ResumeProfessionalExperience[];

  @OneToMany(() => ResumeAcademicFormation, (formation) => formation.resume, {
    cascade: true,
  })
  academicFormations: ResumeAcademicFormation[];

  @OneToMany(() => ResumeAchievement, (achievement) => achievement.resume, {
    cascade: true,
  })
  achievements: ResumeAchievement[];

  @OneToMany(() => ResumeLanguage, (language) => language.resume, {
    cascade: true,
  })
  languages: ResumeLanguage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
