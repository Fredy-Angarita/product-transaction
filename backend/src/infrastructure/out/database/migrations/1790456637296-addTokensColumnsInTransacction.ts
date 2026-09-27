import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTokensColumnsInTransacction1790456637296 implements MigrationInterface {
    name = 'AddTokensColumnsInTransacction1790456637296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "acceptance_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "accept_personal_auth" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_80451289d4b0260a110a2040fcc"`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "customer_uuid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b" FOREIGN KEY ("status_id") REFERENCES "transaction-status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_80451289d4b0260a110a2040fcc" FOREIGN KEY ("customer_uuid") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_80451289d4b0260a110a2040fcc"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b"`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "customer_uuid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_80451289d4b0260a110a2040fcc" FOREIGN KEY ("customer_uuid") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b" FOREIGN KEY ("status_id") REFERENCES "transaction-status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "accept_personal_auth"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "acceptance_token"`);
    }

}
