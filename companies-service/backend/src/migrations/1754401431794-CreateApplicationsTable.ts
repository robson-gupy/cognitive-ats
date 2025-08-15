import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateApplicationsTable1754401431794
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'applications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
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
            name: 'primeiro_nome',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'sobrenome',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'celular',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Criar índices
    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'IDX_applications_job_id',
        columnNames: ['job_id'],
      }),
    );

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'IDX_applications_company_id',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'IDX_applications_job_company',
        columnNames: ['job_id', 'company_id'],
      }),
    );

    // Criar foreign keys
    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        name: 'FK_applications_job_id',
        columnNames: ['job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'jobs',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        name: 'FK_applications_company_id',
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign keys
    await queryRunner.dropForeignKey(
      'applications',
      'FK_applications_company_id',
    );
    await queryRunner.dropForeignKey('applications', 'FK_applications_job_id');

    // Remover índices
    await queryRunner.dropIndex('applications', 'IDX_applications_job_company');
    await queryRunner.dropIndex('applications', 'IDX_applications_company_id');
    await queryRunner.dropIndex('applications', 'IDX_applications_job_id');

    // Remover tabela
    await queryRunner.dropTable('applications');
  }
}
