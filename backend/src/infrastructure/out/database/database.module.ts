import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { ProductEntity } from './entity/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(DataSourceConfig),
    TypeOrmModule.forFeature([ProductEntity]),
  ],
  exports: [],
})
export class DatabaseModule {}
