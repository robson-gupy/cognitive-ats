import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Application } from './application.entity';

@Entity('adress')
export class Adress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'street', length: 255, nullable: true })
  street: string;

  @Column({ name: 'neighborhood', length: 255, nullable: true })
  neighborhood: string;

  @Column({ name: 'city', length: 255, nullable: true })
  city: string;

  @Column({ name: 'state', length: 2, nullable: true })
  state: string;

  @Column({ name: 'zip_code', length: 9, nullable: true })
  zipCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Application, (application) => application.address)
  application: Application;
}


