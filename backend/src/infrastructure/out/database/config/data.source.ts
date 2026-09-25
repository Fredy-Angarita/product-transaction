import 'dotenv/config';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductEntity } from '../entity/product.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { DeliveryEntity } from '../entity/delivery.entity';
import { OrderItemEntity } from '../entity/order.item.entity';
import { TransactionEntity } from '../entity/transaction.entity';
import { CustomerEntity } from '../entity/customer.entity';

export const DataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [
    ProductEntity,
    TransactionStatusEntity,
    DeliveryEntity,
    OrderItemEntity,
    TransactionEntity,
    CustomerEntity,
  ],
  migrations: [path.join(__dirname, '../migrations/*.{js,ts}')],
};

export const dataSourceInstance: DataSource = new DataSource(DataSourceConfig);
