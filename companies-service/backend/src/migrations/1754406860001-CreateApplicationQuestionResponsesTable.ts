import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateApplicationQuestionResponsesTable1754406860001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'application_question_responses',
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
            name: 'job_question_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'question',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'answer',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Criar índices
    await queryRunner.createIndex(
      'application_question_responses',
      new TableIndex({
        name: 'IDX_application_question_responses_application_id',
        columnNames: ['application_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_question_responses',
      new TableIndex({
        name: 'IDX_application_question_responses_job_id',
        columnNames: ['job_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_question_responses',
      new TableIndex({
        name: 'IDX_application_question_responses_company_id',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'application_question_responses',
      new TableIndex({
        name: 'IDX_application_question_responses_job_question_id',
        columnNames: ['job_question_id'],
      }),
    );

    // Índice único para evitar respostas duplicadas
    await queryRunner.createIndex(
      'application_question_responses',
      new TableIndex({
        name: 'IDX_application_question_responses_unique',
        columnNames: ['application_id', 'job_question_id'],
        isUnique: true,
      }),
    );

    // Adicionar foreign keys
    await queryRunner.createForeignKey(
      'application_question_responses',
      new TableForeignKey({
        name: 'FK_application_question_responses_application_id',
        columnNames: ['application_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'applications',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_question_responses',
      new TableForeignKey({
        name: 'FK_application_question_responses_job_question_id',
        columnNames: ['job_question_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'job_questions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'application_question_responses',
      new TableForeignKey({
        name: 'FK_application_question_responses_company_id',
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('application_question_responses');
  }
}
