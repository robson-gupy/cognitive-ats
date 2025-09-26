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
import { ApplicationTag } from '../../applications/entities/application-tag.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('tags')
@Index(['companyId', 'label'], { unique: true }) // Tag única por empresa
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  label: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 7, default: '#3B82F6' }) // Formato hex color (#RRGGBB)
  color: string;

  @Column({ length: 7, default: '#FFFFFF' }) // Formato hex color (#RRGGBB)
  textColor: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ApplicationTag, (applicationTag) => applicationTag.tag)
  applicationTags: ApplicationTag[];
}
