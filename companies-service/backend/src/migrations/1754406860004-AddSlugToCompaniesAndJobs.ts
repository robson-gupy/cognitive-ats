import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToCompaniesAndJobs1754406860004
  implements MigrationInterface
{
  name = 'AddSlugToCompaniesAndJobs1754406860004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar campo slug à tabela companies com valor padrão aleatório
    await queryRunner.query(`
      ALTER TABLE "companies" 
      ADD COLUMN "slug" character varying(500) NOT NULL DEFAULT 'company-' || substr(md5(random()::text), 1, 8)
    `);

    // Adicionar campo slug à tabela jobs com valor padrão aleatório
    await queryRunner.query(`
      ALTER TABLE "jobs" 
      ADD COLUMN "slug" character varying(500) NOT NULL DEFAULT 'job-' || substr(md5(random()::text), 1, 8)
    `);

    // Criar índices únicos para os campos slug
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_companies_slug" ON "companies" ("slug")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_jobs_slug" ON "jobs" ("slug")
    `);

    // Atualizar slugs existentes baseados no nome/título, garantindo unicidade
    await queryRunner.query(`
      UPDATE "companies" 
      SET "slug" = CASE 
        WHEN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g')) = '' 
        THEN 'company-' || substr(md5(random()::text), 1, 8)
        ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g'))
      END
    `);

    await queryRunner.query(`
      UPDATE "jobs" 
      SET "slug" = CASE 
        WHEN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g')) = '' 
        THEN 'job-' || substr(md5(random()::text), 1, 8)
        ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s-]', '', 'g'), '\\s+', '-', 'g'))
      END
    `);

    // Garantir que todos os slugs sejam únicos adicionando sufixos se necessário
    await queryRunner.query(`
      UPDATE "companies" c1
      SET "slug" = c1."slug" || '-' || substr(md5(random()::text), 1, 4)
      WHERE EXISTS (
        SELECT 1 FROM "companies" c2 
        WHERE c2."slug" = c1."slug" AND c2.id != c1.id
      )
    `);

    await queryRunner.query(`
      UPDATE "jobs" j1
      SET "slug" = j1."slug" || '-' || substr(md5(random()::text), 1, 4)
      WHERE EXISTS (
        SELECT 1 FROM "jobs" j2 
        WHERE j2."slug" = j1."slug" AND j2.id != j1.id
      )
    `);

    // Remover valores padrão e tornar os campos NOT NULL
    await queryRunner.query(`
      ALTER TABLE "companies" 
      ALTER COLUMN "slug" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "jobs" 
      ALTER COLUMN "slug" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices únicos
    await queryRunner.query(`DROP INDEX "IDX_jobs_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_companies_slug"`);

    // Remover colunas slug
    await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "slug"`);
  }
}
