import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Application } from './application.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { User } from '../../users/entities/user.entity';

@Entity('application_tags')
@Unique(['applicationId', 'tagId']) // Uma tag só pode ser adicionada uma vez por application
export class ApplicationTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'tag_id', type: 'uuid' })
  tagId: string;

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @Column({ name: 'added_by_user_id', type: 'uuid' })
  addedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by_user_id' })
  addedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
