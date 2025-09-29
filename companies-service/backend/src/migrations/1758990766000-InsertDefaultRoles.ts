import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertDefaultRoles1758990766000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Inserir roles padrão do sistema
    await queryRunner.query(`
      INSERT INTO roles (id, name, code, description, is_active, created_at, updated_at) VALUES
      (
        gen_random_uuid(),
        'Administrador',
        'ADMIN',
        'Acesso completo ao sistema',
        true,
        NOW(),
        NOW()
      ),
      (
        gen_random_uuid(),
        'Recrutador',
        'RECRUITER',
        'Acesso para gerenciar candidatos e vagas',
        true,
        NOW(),
        NOW()
      ),
      (
        gen_random_uuid(),
        'Gestor',
        'MANAGER',
        'Acesso para gerenciar equipes e processos',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (code) DO NOTHING
    `);

    // Adicionar comentário na tabela para documentação
    await queryRunner.query(`
      COMMENT ON TABLE roles IS 'Tabela de roles do sistema - define os tipos de usuários e suas permissões'
    `);

    // Adicionar comentários nas colunas
    await queryRunner.query(`
      COMMENT ON COLUMN roles.code IS 'Código único da role (ADMIN, RECRUITER, MANAGER)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.name IS 'Nome descritivo da role'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.description IS 'Descrição detalhada das permissões da role'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.is_active IS 'Indica se a role está ativa no sistema'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover as roles inseridas (apenas as padrão, não roles customizadas)
    await queryRunner.query(`
      DELETE FROM roles 
      WHERE code IN ('ADMIN', 'RECRUITER', 'MANAGER')
    `);

    // Remover os comentários
    await queryRunner.query(`
      COMMENT ON TABLE roles IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.code IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.name IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.description IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN roles.is_active IS NULL
    `);
  }
}
