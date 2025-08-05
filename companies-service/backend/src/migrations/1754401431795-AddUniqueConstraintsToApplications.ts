import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddUniqueConstraintsToApplications1754401431795 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, limpar dados duplicados
    console.log('Limpando aplicações duplicadas...');
    
    // Remover duplicatas de email por vaga
    await queryRunner.query(`
      DELETE FROM applications 
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY job_id, email 
                   ORDER BY created_at
                 ) as rn
          FROM applications 
          WHERE email IS NOT NULL
        ) t 
        WHERE t.rn > 1
      )
    `);

    // Remover duplicatas de celular por vaga
    await queryRunner.query(`
      DELETE FROM applications 
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
                 ROW_NUMBER() OVER (
                   PARTITION BY job_id, celular 
                   ORDER BY created_at
                 ) as rn
          FROM applications 
          WHERE celular IS NOT NULL
        ) t 
        WHERE t.rn > 1
      )
    `);

    console.log('Criando índices únicos...');

    // Adicionar índice único para email por vaga (apenas para emails não nulos)
    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'IDX_applications_job_email_unique',
        columnNames: ['job_id', 'email'],
        isUnique: true,
        where: 'email IS NOT NULL',
      }),
    );

    // Adicionar índice único para celular por vaga (apenas para celulares não nulos)
    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'IDX_applications_job_celular_unique',
        columnNames: ['job_id', 'celular'],
        isUnique: true,
        where: 'celular IS NOT NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices únicos
    await queryRunner.dropIndex('applications', 'IDX_applications_job_celular_unique');
    await queryRunner.dropIndex('applications', 'IDX_applications_job_email_unique');
  }
} 