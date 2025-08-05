import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobIndexes1754401431793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar índices para otimizar consultas na tabela jobs

    // Índice individual para companyId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
    `);

    // Índice individual para status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    `);

    // Índice composto para companyId e publishedAt
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_published ON jobs(company_id, published_at);
    `);

    // Índice composto para companyId e closedAt
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_closed ON jobs(company_id, closed_at);
    `);

    // Índice composto para companyId e status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON jobs(company_id, status);
    `);

    // Índice composto para companyId e departmentId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_department ON jobs(company_id, department_id);
    `);

    // Índice composto para companyId, status e publishedAt
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_status_published ON jobs(company_id, status, published_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices na ordem reversa

    // Remover índice composto para companyId, status e publishedAt
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_company_status_published;
    `);

    // Remover índice composto para companyId e departmentId
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_company_department;
    `);

    // Remover índice composto para companyId e status
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_company_status;
    `);

    // Remover índice composto para companyId e closedAt
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_company_closed;
    `);

    // Remover índice composto para companyId e publishedAt
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_company_published;
    `);

    // Remover índice individual para status
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_status;
    `);

    // Remover índice individual para companyId
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_company_id;
    `);
  }
} 