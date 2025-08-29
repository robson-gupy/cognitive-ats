import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class AddCompanyIdToTags1756487862000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna company_id
    await queryRunner.addColumn(
      'tags',
      new TableColumn({
        name: 'company_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    // Criar índice para company_id
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_tags_company_id',
        columnNames: ['company_id'],
      }),
    );

    // Criar índice composto único para company_id + label
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_tags_company_label_unique',
        columnNames: ['company_id', 'label'],
        isUnique: true,
      }),
    );

    // Remover o índice único antigo de label (se existir)
    try {
      await queryRunner.dropIndex('tags', 'IDX_tags_label');
    } catch (error) {
      // Índice pode não existir, ignorar erro
    }

    // Criar foreign key para company_id
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key
    await queryRunner.dropForeignKey('tags', 'FK_tags_company_id');

    // Remover índices
    await queryRunner.dropIndex('tags', 'IDX_tags_company_label_unique');
    await queryRunner.dropIndex('tags', 'IDX_tags_company_id');

    // Recriar o índice único antigo de label
    await queryRunner.createIndex(
      'tags',
      new TableIndex({
        name: 'IDX_tags_label',
        columnNames: ['label'],
      }),
    );

    // Remover coluna company_id
    await queryRunner.dropColumn('tags', 'company_id');
  }
}
