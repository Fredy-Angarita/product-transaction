import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PRODUCT_PERSISTENCE_PORT } from '../../../../domain/spi/product.persistence.port';
import { DataSourceConfig } from './config/data.source';
import { ProductEntity } from './entity/product.entity';
import { TransactionStatusEntity } from './entity/transaction.status.entity';
import { ProductRepository } from './repository/product.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(DataSourceConfig),
    TypeOrmModule.forFeature([ProductEntity, TransactionStatusEntity]),
  ],
  providers: [
    ProductRepository,
    {
      provide: PRODUCT_PERSISTENCE_PORT,
      useExisting: ProductRepository,
    },
  ],
  exports: [PRODUCT_PERSISTENCE_PORT],
})
export class DatabaseModule {}
