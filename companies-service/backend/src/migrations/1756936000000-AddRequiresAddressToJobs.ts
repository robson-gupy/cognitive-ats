import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiresAddressToJobs1756936000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE jobs
      ADD COLUMN IF NOT EXISTS requires_address boolean DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE jobs
      DROP COLUMN IF EXISTS requires_address;
    `);
  }
}


