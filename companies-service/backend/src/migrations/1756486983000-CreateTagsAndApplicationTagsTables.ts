import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTagsAndApplicationTagsTables1756486983000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de tags
    await queryRunner.createTable(
      new Table({
        name: 'tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'label',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '7',
            isNullable: false,
            default: "'#3B82F6'",
          },
          {
            name: 'text_color',
            type: 'varchar',
            length: '7',
            isNullable: false,
            default: "'#FFFFFF'",
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

    // Criar tabela de application_tags
    await queryRunner.createTable(
      new Table({
        name: 'application_tags',
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
            name: 'tag_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'added_by_user_id',
            type: 'uuid',
            isNullable: false,
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

    // Criar índices para a tabela tags
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_tags_company_id',
        columnNames: ['company_id'],
      }),
    );

    // Criar índice único composto para company_id + label
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_tags_company_label_unique',
        columnNames: ['company_id', 'label'],
        isUnique: true,
      }),
    );

    // Criar índices para a tabela application_tags
    await queryRunner.createIndex(
      'application_tags',
      new TableIndex({
        name: 'IDX_application_tags_application_id',
        columnNames: ['application_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_tags',
      new TableIndex({
        name: 'IDX_application_tags_tag_id',
        columnNames: ['tag_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_tags',
      new TableIndex({
        name: 'IDX_application_tags_added_by_user_id',
        columnNames: ['added_by_user_id'],
      }),
    );

    // Criar foreign key para tags.company_id
    await queryRunner.createForeignKey(
      'tags',
      new TableForeignKey({
        name: 'FK_tags_company_id',
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    // Criar foreign keys para application_tags
    await queryRunner.createForeignKey(
      'application_tags',
      new TableForeignKey({
        name: 'FK_application_tags_application_id',
        columnNames: ['application_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'applications',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_tags',
      new TableForeignKey({
        name: 'FK_application_tags_tag_id',
        columnNames: ['tag_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tags',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_tags',
      new TableForeignKey({
        name: 'FK_application_tags_added_by_user_id',
        columnNames: ['added_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    // Criar constraint único para application_id + tag_id
    await queryRunner.createIndex(
      'application_tags',
      new TableIndex({
        name: 'IDX_application_tags_application_tag_unique',
        columnNames: ['application_id', 'tag_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign keys
    await queryRunner.dropForeignKey('tags', 'FK_tags_company_id');
    await queryRunner.dropForeignKey(
      'application_tags',
      'FK_application_tags_added_by_user_id',
    );
    await queryRunner.dropForeignKey(
      'application_tags',
      'FK_application_tags_tag_id',
    );
    await queryRunner.dropForeignKey(
      'application_tags',
      'FK_application_tags_application_id',
    );

    // Remover tabelas
    await queryRunner.dropTable('application_tags');
    await queryRunner.dropTable('tags');
  }
}
