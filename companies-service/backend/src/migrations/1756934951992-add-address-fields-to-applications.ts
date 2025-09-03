import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressFieldsToApplications1756934951992 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "logradouro" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "bairro" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cidade" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "uf" varchar(2)`);
        await queryRunner.query(`ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "cep" varchar(9)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "cep"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "uf"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "cidade"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "bairro"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN IF EXISTS "logradouro"`);
    }

}
