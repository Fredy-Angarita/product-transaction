import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllTables1790291403173 implements MigrationInterface {
  name = 'AddAllTables1790291403173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "lastName" character varying(150) NOT NULL, "dni" character varying(50) NOT NULL, "email" character varying(200) NOT NULL, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction-status" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL, CONSTRAINT "PK_d82f9cc71521130c60cf4850230" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying(150) NOT NULL, "city" character varying(150) NOT NULL, "locality" character varying(150) NOT NULL, "subLocality" character varying(150) NOT NULL, "address" character varying NOT NULL, "postal_code" character varying(50) NOT NULL, "additionalInfo" text NOT NULL, "transaction_id" uuid, CONSTRAINT "REL_e1dd06d37dd9bf4271417d002b" UNIQUE ("transaction_id"), CONSTRAINT "PK_ffad7bf84e68716cd9af89003b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_reference" character varying NOT NULL, "total" numeric(12,2) NOT NULL, "create_at" TIMESTAMP NOT NULL DEFAULT now(), "update_at" TIMESTAMP NOT NULL DEFAULT now(), "status_id" integer, "customer_uuid" uuid, CONSTRAINT "PK_fcce0ce5cc7762e90d2cc7e2307" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_id" uuid NOT NULL, "product_id" uuid NOT NULL, "price" numeric(12,2) NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "image" text NOT NULL, "price" numeric(12,2) NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery" ADD CONSTRAINT "FK_e1dd06d37dd9bf4271417d002b9" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b" FOREIGN KEY ("status_id") REFERENCES "transaction-status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_80451289d4b0260a110a2040fcc" FOREIGN KEY ("customer_uuid") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_9a1bb28fa50a4d18d6be17d2180" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_5e17c017aa3f5164cb2da5b1c6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_9a1bb28fa50a4d18d6be17d2180"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_80451289d4b0260a110a2040fcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_05fbbdf6bc1db819f47975c8c0b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery" DROP CONSTRAINT "FK_e1dd06d37dd9bf4271417d002b9"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "delivery"`);
    await queryRunner.query(`DROP TABLE "transaction-status"`);
    await queryRunner.query(`DROP TABLE "customer"`);
  }
}
