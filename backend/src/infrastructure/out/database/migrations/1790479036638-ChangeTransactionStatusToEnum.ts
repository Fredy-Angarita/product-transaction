import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTransactionStatusToEnum1790479036638 implements MigrationInterface {
    name = 'ChangeTransactionStatusToEnum1790479036638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "status_id" TO "status"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'PENDING'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "status" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "status" TO "status_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b" FOREIGN KEY ("status_id") REFERENCES "transaction-status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
