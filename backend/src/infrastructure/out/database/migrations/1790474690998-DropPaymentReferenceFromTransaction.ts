import { MigrationInterface, QueryRunner } from "typeorm";

export class DropPaymentReferenceFromTransaction1790474690998 implements MigrationInterface {
    name = 'DropPaymentReferenceFromTransaction1790474690998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "payment_reference"`);
        await queryRunner.query(`ALTER TABLE "delivery" ADD "fee" numeric(12,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery" DROP COLUMN "fee"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "payment_reference" character varying NOT NULL`);
    }

}
