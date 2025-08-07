import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEvaluationScoresToApplications1754406860003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('applications', [
      new TableColumn({
        name: 'overall_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
        comment: 'Nota geral de aderência do candidato à vaga (0-100)',
      }),
      new TableColumn({
        name: 'question_responses_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
        comment: 'Nota das respostas das perguntas (0-100)',
      }),
      new TableColumn({
        name: 'education_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
        comment: 'Nota da formação acadêmica (0-100)',
      }),
      new TableColumn({
        name: 'experience_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
        comment: 'Nota da experiência profissional (0-100)',
      }),
      new TableColumn({
        name: 'evaluation_provider',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Provider de IA usado na avaliação',
      }),
      new TableColumn({
        name: 'evaluation_model',
        type: 'varchar',
        length: '100',
        isNullable: true,
        comment: 'Modelo de IA usado na avaliação',
      }),
      new TableColumn({
        name: 'evaluation_details',
        type: 'jsonb',
        isNullable: true,
        comment: 'Detalhes da avaliação em formato JSON',
      }),
      new TableColumn({
        name: 'evaluated_at',
        type: 'timestamp',
        isNullable: true,
        comment: 'Data e hora da avaliação',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('applications', [
      'overall_score',
      'question_responses_score',
      'education_score',
      'experience_score',
      'evaluation_provider',
      'evaluation_model',
      'evaluation_details',
      'evaluated_at',
    ]);
  }
}
