import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class AddApplicationStageFields1754406860002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar campo current_stage_id na tabela applications
    await queryRunner.query(`
      ALTER TABLE applications 
      ADD COLUMN current_stage_id UUID,
      ADD CONSTRAINT fk_applications_current_stage 
      FOREIGN KEY (current_stage_id) REFERENCES job_stages(id) ON DELETE SET NULL
    `);

    // Criar tabela application_stage_history
    await queryRunner.createTable(
      new Table({
        name: 'application_stage_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'application_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'job_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'from_stage_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'to_stage_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'changed_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Criar índices para application_stage_history
    await queryRunner.createIndex(
      'application_stage_history',
      new TableIndex({
        name: 'IDX_application_stage_history_application_id',
        columnNames: ['application_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_stage_history',
      new TableIndex({
        name: 'IDX_application_stage_history_job_id',
        columnNames: ['job_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_stage_history',
      new TableIndex({
        name: 'IDX_application_stage_history_company_id',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_stage_history',
      new TableIndex({
        name: 'IDX_application_stage_history_application_created',
        columnNames: ['application_id', 'created_at'],
      }),
    );

    // Criar foreign keys para application_stage_history
    await queryRunner.createForeignKey(
      'application_stage_history',
      new TableForeignKey({
        name: 'FK_application_stage_history_application',
        columnNames: ['application_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'applications',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_stage_history',
      new TableForeignKey({
        name: 'FK_application_stage_history_from_stage',
        columnNames: ['from_stage_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'job_stages',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'application_stage_history',
      new TableForeignKey({
        name: 'FK_application_stage_history_to_stage',
        columnNames: ['to_stage_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'job_stages',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'application_stage_history',
      new TableForeignKey({
        name: 'FK_application_stage_history_changed_by',
        columnNames: ['changed_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign keys da application_stage_history
    await queryRunner.dropForeignKey(
      'application_stage_history',
      'FK_application_stage_history_changed_by',
    );
    await queryRunner.dropForeignKey(
      'application_stage_history',
      'FK_application_stage_history_to_stage',
    );
    await queryRunner.dropForeignKey(
      'application_stage_history',
      'FK_application_stage_history_from_stage',
    );
    await queryRunner.dropForeignKey(
      'application_stage_history',
      'FK_application_stage_history_application',
    );

    // Remover índices da application_stage_history
    await queryRunner.dropIndex(
      'application_stage_history',
      'IDX_application_stage_history_application_created',
    );
    await queryRunner.dropIndex(
      'application_stage_history',
      'IDX_application_stage_history_company_id',
    );
    await queryRunner.dropIndex(
      'application_stage_history',
      'IDX_application_stage_history_job_id',
    );
    await queryRunner.dropIndex(
      'application_stage_history',
      'IDX_application_stage_history_application_id',
    );

    // Remover tabela application_stage_history
    await queryRunner.dropTable('application_stage_history');

    // Remover campo current_stage_id da tabela applications
    await queryRunner.query(`
      ALTER TABLE applications 
      DROP CONSTRAINT fk_applications_current_stage,
      DROP COLUMN current_stage_id
    `);
  }
}
