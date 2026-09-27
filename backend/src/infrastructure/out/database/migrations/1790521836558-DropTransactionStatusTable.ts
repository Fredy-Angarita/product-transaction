import { MigrationInterface, QueryRunner } from "typeorm";

export class DropTransactionStatusTable1790521836558 implements MigrationInterface {
    name = 'DropTransactionStatusTable1790521836558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transaction-status"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "transaction-status" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL, CONSTRAINT "PK_d82f9cc71521130c60cf4850230" PRIMARY KEY ("id"))`,
        );
    }

}
