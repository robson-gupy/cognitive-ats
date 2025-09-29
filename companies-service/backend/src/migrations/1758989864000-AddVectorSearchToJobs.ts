import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVectorSearchToJobs1758989864000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar a extensão pgvector se ainda não estiver habilitada
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS vector
    `);

    // Adicionar coluna de embedding vetorial para busca semântica (se não existir)
    await queryRunner.query(`
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS search_embedding text NULL
    `);

    // Adicionar comentário na coluna para documentação
    await queryRunner.query(`
      COMMENT ON COLUMN jobs.search_embedding IS 'Vetor de embedding para busca semântica combinando title, description e department name'
    `);

    // Criar índice para busca eficiente na coluna de embedding
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_search_embedding 
      ON jobs (search_embedding) 
      WHERE search_embedding IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover o índice de embedding
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_search_embedding
    `);

    // Remover a coluna de embedding
    await queryRunner.query(`
      ALTER TABLE jobs 
      DROP COLUMN IF EXISTS search_embedding
    `);

    // Nota: Não removemos a extensão pgvector pois pode estar sendo usada por outras tabelas
  }
}
