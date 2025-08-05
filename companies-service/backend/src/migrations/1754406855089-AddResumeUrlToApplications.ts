import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumeUrlToApplications1754406855089 implements MigrationInterface {
  name = 'AddResumeUrlToApplications1754406855089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "resume_url" character varying(500)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "resume_url"`);
  }
} 