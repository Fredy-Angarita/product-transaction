import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductTable1790286262492 implements MigrationInterface {
    name = 'ProductTable1790286262492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "image" text NOT NULL, "price" numeric(12,2) NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
