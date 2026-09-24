import 'dotenv/config';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductEntity } from '../entity/product.entity';

export const DataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [ProductEntity],
  migrations: [path.join(__dirname, '../migrations/*.{js,ts}')],
};

export const dataSourceInstance: DataSource = new DataSource(DataSourceConfig);
