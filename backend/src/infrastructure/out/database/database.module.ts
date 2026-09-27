import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CUSTOMER_PERSISTENCE_PORT } from '../../../../domain/spi/customer.persistence.port';
import { DELIVERY_PERSISTENCE_PORT } from '../../../../domain/spi/delivery.persistence.port';
import { ORDER_ITEM_PERSISTENCE_PORT } from '../../../../domain/spi/order-item.persistence.port';
import { PRODUCT_PERSISTENCE_PORT } from '../../../../domain/spi/product.persistence.port';
import { TRANSACTION_PERSISTENCE_PORT } from '../../../../domain/spi/transaction.persistence.port';
import { TRANSACTION_STATUS_PERSISTENCE_PORT } from '../../../../domain/spi/transaction-status.persistence.port';
import { DataSourceConfig } from './config/data.source';
import { CustomerEntity } from './entity/customer.entity';
import { DeliveryEntity } from './entity/delivery.entity';
import { OrderItemEntity } from './entity/order.item.entity';
import { ProductEntity } from './entity/product.entity';
import { TransactionStatusEntity } from './entity/transaction.status.entity';
import { TransactionEntity } from './entity/transaction.entity';
import { CustomerRepository } from './repository/customer.repository';
import { DeliveryRepository } from './repository/delivery.repository';
import { OrderItemRepository } from './repository/order-item.repository';
import { ProductRepository } from './repository/product.repository';
import { TransactionStatusRepository } from './repository/transaction-status.repository';
import { TransactionRepository } from './repository/transaction.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(DataSourceConfig),
    TypeOrmModule.forFeature([
      ProductEntity,
      CustomerEntity,
      DeliveryEntity,
      OrderItemEntity,
      TransactionEntity,
      TransactionStatusEntity,
    ]),
  ],
  providers: [
    ProductRepository,
    CustomerRepository,
    DeliveryRepository,
    OrderItemRepository,
    TransactionRepository,
    TransactionStatusRepository,
    {
      provide: PRODUCT_PERSISTENCE_PORT,
      useExisting: ProductRepository,
    },
    {
      provide: CUSTOMER_PERSISTENCE_PORT,
      useExisting: CustomerRepository,
    },
    {
      provide: DELIVERY_PERSISTENCE_PORT,
      useExisting: DeliveryRepository,
    },
    {
      provide: ORDER_ITEM_PERSISTENCE_PORT,
      useExisting: OrderItemRepository,
    },
    {
      provide: TRANSACTION_PERSISTENCE_PORT,
      useExisting: TransactionRepository,
    },
    {
      provide: TRANSACTION_STATUS_PERSISTENCE_PORT,
      useExisting: TransactionStatusRepository,
    },
  ],
  exports: [
    PRODUCT_PERSISTENCE_PORT,
    CUSTOMER_PERSISTENCE_PORT,
    DELIVERY_PERSISTENCE_PORT,
    ORDER_ITEM_PERSISTENCE_PORT,
    TRANSACTION_PERSISTENCE_PORT,
    TRANSACTION_STATUS_PERSISTENCE_PORT,
  ],
})
export class DatabaseModule {}
