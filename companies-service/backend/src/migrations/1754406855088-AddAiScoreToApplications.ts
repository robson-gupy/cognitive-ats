import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiScoreToApplications1754406855088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna ai_score para armazenar o score gerado pela IA
    await queryRunner.query(`
      ALTER TABLE applications 
      ADD COLUMN ai_score DECIMAL(5,2) NULL
    `);

    // Adicionar comentário na coluna para documentação
    await queryRunner.query(`
      COMMENT ON COLUMN applications.ai_score IS 'Score gerado pela IA para avaliação da candidatura (0.00 a 100.00)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover a coluna ai_score
    await queryRunner.query(`
      ALTER TABLE applications 
      DROP COLUMN ai_score
    `);
  }
} 