import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResumeTables1754406860000 implements MigrationInterface {
  name = 'CreateResumeTables1754406860000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de currículos
    await queryRunner.query(`
      CREATE TABLE "resumes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "application_id" uuid NOT NULL,
        "summary" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_resumes_application_id" UNIQUE ("application_id"),
        CONSTRAINT "PK_resumes" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de experiências profissionais
    await queryRunner.query(`
      CREATE TABLE "resume_professional_experiences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "resume_id" uuid NOT NULL,
        "company_name" character varying(255) NOT NULL,
        "position" character varying(255) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "is_current" boolean NOT NULL DEFAULT false,
        "description" text,
        "responsibilities" text,
        "achievements" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resume_professional_experiences" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de formações acadêmicas
    await queryRunner.query(`
      CREATE TABLE "resume_academic_formations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "resume_id" uuid NOT NULL,
        "institution" character varying(255) NOT NULL,
        "course" character varying(255) NOT NULL,
        "degree" character varying(100) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "is_current" boolean NOT NULL DEFAULT false,
        "status" character varying(50) NOT NULL DEFAULT 'completed',
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resume_academic_formations" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de conquistas
    await queryRunner.query(`
      CREATE TABLE "resume_achievements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "resume_id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resume_achievements" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de idiomas
    await queryRunner.query(`
      CREATE TABLE "resume_languages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "resume_id" uuid NOT NULL,
        "language" character varying(100) NOT NULL,
        "proficiency_level" character varying(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resume_languages" PRIMARY KEY ("id")
      )
    `);

    // Adicionar chaves estrangeiras
    await queryRunner.query(`
      ALTER TABLE "resumes" 
      ADD CONSTRAINT "FK_resumes_application_id" 
      FOREIGN KEY ("application_id") 
      REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "resume_professional_experiences" 
      ADD CONSTRAINT "FK_resume_professional_experiences_resume_id" 
      FOREIGN KEY ("resume_id") 
      REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "resume_academic_formations" 
      ADD CONSTRAINT "FK_resume_academic_formations_resume_id" 
      FOREIGN KEY ("resume_id") 
      REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "resume_achievements" 
      ADD CONSTRAINT "FK_resume_achievements_resume_id" 
      FOREIGN KEY ("resume_id") 
      REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "resume_languages" 
      ADD CONSTRAINT "FK_resume_languages_resume_id" 
      FOREIGN KEY ("resume_id") 
      REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Criar índices
    await queryRunner.query(`
      CREATE INDEX "IDX_resume_professional_experiences_resume_id" 
      ON "resume_professional_experiences" ("resume_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_resume_academic_formations_resume_id" 
      ON "resume_academic_formations" ("resume_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_resume_achievements_resume_id" 
      ON "resume_achievements" ("resume_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_resume_languages_resume_id" 
      ON "resume_languages" ("resume_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX "IDX_resume_languages_resume_id"`);
    await queryRunner.query(`DROP INDEX "IDX_resume_achievements_resume_id"`);
    await queryRunner.query(`DROP INDEX "IDX_resume_academic_formations_resume_id"`);
    await queryRunner.query(`DROP INDEX "IDX_resume_professional_experiences_resume_id"`);

    // Remover chaves estrangeiras
    await queryRunner.query(`ALTER TABLE "resume_languages" DROP CONSTRAINT "FK_resume_languages_resume_id"`);
    await queryRunner.query(`ALTER TABLE "resume_achievements" DROP CONSTRAINT "FK_resume_achievements_resume_id"`);
    await queryRunner.query(`ALTER TABLE "resume_academic_formations" DROP CONSTRAINT "FK_resume_academic_formations_resume_id"`);
    await queryRunner.query(`ALTER TABLE "resume_professional_experiences" DROP CONSTRAINT "FK_resume_professional_experiences_resume_id"`);
    await queryRunner.query(`ALTER TABLE "resumes" DROP CONSTRAINT "FK_resumes_application_id"`);

    // Remover tabelas
    await queryRunner.query(`DROP TABLE "resume_languages"`);
    await queryRunner.query(`DROP TABLE "resume_achievements"`);
    await queryRunner.query(`DROP TABLE "resume_academic_formations"`);
    await queryRunner.query(`DROP TABLE "resume_professional_experiences"`);
    await queryRunner.query(`DROP TABLE "resumes"`);
  }
} 