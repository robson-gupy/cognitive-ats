import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdressTableAndRelation1756937100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "adress" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        street varchar(255),
        neighborhood varchar(255),
        city varchar(255),
        state varchar(2),
        zip_code varchar(9),
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "address_id" uuid`,
    );

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE applications
        ADD CONSTRAINT fk_applications_address
        FOREIGN KEY (address_id) REFERENCES adress(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_address_id ON applications(address_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_address`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_applications_address_id`,
    );
    await queryRunner.query(
      `ALTER TABLE applications DROP COLUMN IF EXISTS address_id`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS adress`);
  }
}


