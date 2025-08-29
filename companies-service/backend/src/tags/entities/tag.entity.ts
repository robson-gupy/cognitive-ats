import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApplicationTag } from '../../applications/entities/application-tag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  label: string;

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
