import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameApplicationFieldsToEnglish1754401431796
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renomear colunas de português para inglês
    await queryRunner.query(
      `ALTER TABLE applications RENAME COLUMN primeiro_nome TO first_name`,
    );
    await queryRunner.query(
      `ALTER TABLE applications RENAME COLUMN sobrenome TO last_name`,
    );
    await queryRunner.query(
      `ALTER TABLE applications RENAME COLUMN celular TO phone`,
    );

    // Recriar índices únicos com os novos nomes de colunas
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_applications_job_email_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_applications_job_celular_unique"`,
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_applications_job_email_unique" 
      ON applications (job_id, email) 
      WHERE email IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_applications_job_phone_unique" 
      ON applications (job_id, phone) 
      WHERE phone IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter índices únicos
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_applications_job_phone_unique"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_applications_job_email_unique"`,
    );

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_applications_job_celular_unique" 
      ON applications (job_id, celular) 
      WHERE celular IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_applications_job_email_unique" 
      ON applications (job_id, email) 
      WHERE email IS NOT NULL
    `);

    // Reverter nomes das colunas
    await queryRunner.query(
      `ALTER TABLE applications RENAME COLUMN phone TO celular`,
    );
    await queryRunner.query(
      `ALTER TABLE applications RENAME COLUMN last_name TO sobrenome`,
    );
    await queryRunner.query(
      `ALTER TABLE applications RENAME COLUMN first_name TO primeiro_nome`,
    );
  }
}
