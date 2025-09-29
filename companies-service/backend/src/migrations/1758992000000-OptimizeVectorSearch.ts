import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeVectorSearch1758992000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar a extensão pgvector se ainda não estiver habilitada
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS vector
    `);

    // Adicionar nova coluna com tipo vector nativo (se não existir)
    await queryRunner.query(`
      ALTER TABLE jobs 
      ADD COLUMN IF NOT EXISTS search_embedding_vector vector(1536) NULL
    `);

    // Copiar dados da coluna text para a nova coluna vector
    await queryRunner.query(`
      UPDATE jobs 
      SET search_embedding_vector = search_embedding::vector 
      WHERE search_embedding IS NOT NULL 
        AND search_embedding != '' 
        AND search_embedding_vector IS NULL
    `);

    // Criar índices otimizados para busca vetorial
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_search_embedding_vector_cosine 
      ON jobs USING ivfflat (search_embedding_vector vector_cosine_ops) 
      WITH (lists = 100)
      WHERE search_embedding_vector IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_jobs_search_embedding_vector_l2 
      ON jobs USING ivfflat (search_embedding_vector vector_l2_ops) 
      WITH (lists = 100)
      WHERE search_embedding_vector IS NOT NULL
    `);

    // Adicionar comentários
    await queryRunner.query(`
      COMMENT ON COLUMN jobs.search_embedding_vector IS 'Vetor de embedding nativo para busca semântica otimizada com pgvector'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_search_embedding_vector_cosine
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_jobs_search_embedding_vector_l2
    `);

    // Remover a coluna vector
    await queryRunner.query(`
      ALTER TABLE jobs 
      DROP COLUMN IF EXISTS search_embedding_vector
    `);
  }
}
