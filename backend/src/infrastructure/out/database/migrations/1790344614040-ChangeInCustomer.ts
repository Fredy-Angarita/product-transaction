import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeInCustomer1790344614040 implements MigrationInterface {
    name = 'ChangeInCustomer1790344614040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" RENAME COLUMN "dni" TO "identificationNumber"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" RENAME COLUMN "identificationNumber" TO "dni"`);
    }

}
