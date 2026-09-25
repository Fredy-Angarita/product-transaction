import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { CustomerHandler } from '../application/handlers/customer.handler';
import { DeliveryHandler } from '../application/handlers/delivery.handler';
import { OrderItemHandler } from '../application/handlers/order-item.handler';
import { ProductHandler } from '../application/handlers/product.handler';
import { TransactionHandler } from '../application/handlers/transaction.handler';
import { TransactionStatusHandler } from '../application/handlers/transaction-status.handler';
import { CUSTOMER_API } from '../domain/api/customer.interface';
import type { ICustomerApi } from '../domain/api/customer.interface';
import { DELIVERY_API } from '../domain/api/delivery.interface';
import type { IDeliveryApi } from '../domain/api/delivery.interface';
import { ORDER_ITEM_API } from '../domain/api/order-item.interface';
import type { IOrderItemApi } from '../domain/api/order-item.interface';
import { PRODUCT_API } from '../domain/api/product.interface';
import type { IProductApi } from '../domain/api/product.interface';
import { TRANSACTION_API } from '../domain/api/transaction.interface';
import type { ITransactionApi } from '../domain/api/transaction.interface';
import { TRANSACTION_STATUS_API } from '../domain/api/transaction-status.interface';
import type { ITransactionStatusApi } from '../domain/api/transaction-status.interface';
import { CustomerUseCase } from '../domain/api/usecase/customer.usecase';
import { DeliveryUseCase } from '../domain/api/usecase/delivery.usecase';
import { OrderItemUseCase } from '../domain/api/usecase/order-item.usecase';
import { ProductUseCase } from '../domain/api/usecase/product.usecase';
import { TransactionUseCase } from '../domain/api/usecase/transaction.usecase';
import { TransactionStatusUseCase } from '../domain/api/usecase/transaction-status.usecase';
import { CUSTOMER_PERSISTENCE_PORT } from '../domain/spi/customer.persistence.port';
import type { ICustomerPersistencePort } from '../domain/spi/customer.persistence.port';
import { DELIVERY_PERSISTENCE_PORT } from '../domain/spi/delivery.persistence.port';
import type { IDeliveryPersistencePort } from '../domain/spi/delivery.persistence.port';
import { ORDER_ITEM_PERSISTENCE_PORT } from '../domain/spi/order-item.persistence.port';
import type { IOrderItemPersistencePort } from '../domain/spi/order-item.persistence.port';
import { PRODUCT_PERSISTENCE_PORT } from '../domain/spi/product.persistence.port';
import type { IProductPersistencePort } from '../domain/spi/product.persistence.port';
import { TRANSACTION_PERSISTENCE_PORT } from '../domain/spi/transaction.persistence.port';
import type { ITransactionPersistencePort } from '../domain/spi/transaction.persistence.port';
import { TRANSACTION_STATUS_PERSISTENCE_PORT } from '../domain/spi/transaction-status.persistence.port';
import type { ITransactionStatusPersistencePort } from '../domain/spi/transaction-status.persistence.port';
import { PRODUCT_SEED_FACTORY } from '../domain/spi/product.seed-factory.port';
import type { IProductSeedFactory } from '../domain/spi/product.seed-factory.port';
import { CustomerController } from './infrastructure/in/controller/customer.controller';
import { DomainExceptionFilter } from './infrastructure/in/filters/domain-exception.filter';
import { DeliveryController } from './infrastructure/in/controller/delivery.controller';
import { OrderItemController } from './infrastructure/in/controller/order-item.controller';
import { ProductController } from './infrastructure/in/controller/product.controller';
import { TransactionController } from './infrastructure/in/controller/transaction.controller';
import { TransactionStatusController } from './infrastructure/in/controller/transaction-status.controller';
import { DatabaseModule } from './infrastructure/out/database/database.module';
import { FakerProductFactory } from './infrastructure/out/faker/faker-product.factory';

const createProductApi = (
  productPersistence: IProductPersistencePort,
  productSeedFactory: IProductSeedFactory,
): IProductApi => new ProductUseCase(productPersistence, productSeedFactory);

const createCustomerApi = (
  customerPersistence: ICustomerPersistencePort,
): ICustomerApi => new CustomerUseCase(customerPersistence);

const createDeliveryApi = (
  deliveryPersistence: IDeliveryPersistencePort,
  transactionPersistence: ITransactionPersistencePort,
): IDeliveryApi =>
  new DeliveryUseCase(deliveryPersistence, transactionPersistence);

const createOrderItemApi = (
  orderItemPersistence: IOrderItemPersistencePort,
  productPersistence: IProductPersistencePort,
  transactionPersistence: ITransactionPersistencePort,
): IOrderItemApi =>
  new OrderItemUseCase(
    orderItemPersistence,
    productPersistence,
    transactionPersistence,
  );

const createTransactionApi = (
  transactionPersistence: ITransactionPersistencePort,
  productPersistence: IProductPersistencePort,
  statusPersistence: ITransactionStatusPersistencePort,
): ITransactionApi =>
  new TransactionUseCase(
    transactionPersistence,
    productPersistence,
    statusPersistence,
  );

const createTransactionStatusApi = (
  statusPersistence: ITransactionStatusPersistencePort,
): ITransactionStatusApi => new TransactionStatusUseCase(statusPersistence);

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [
    ProductController,
    CustomerController,
    DeliveryController,
    OrderItemController,
    TransactionController,
    TransactionStatusController,
  ],
  providers: [
    FakerProductFactory,
    ProductHandler,
    CustomerHandler,
    DeliveryHandler,
    OrderItemHandler,
    TransactionHandler,
    TransactionStatusHandler,
    {
      provide: PRODUCT_SEED_FACTORY,
      useExisting: FakerProductFactory,
    },
    {
      provide: PRODUCT_API,
      useFactory: createProductApi,
      inject: [PRODUCT_PERSISTENCE_PORT, PRODUCT_SEED_FACTORY],
    },
    {
      provide: CUSTOMER_API,
      useFactory: createCustomerApi,
      inject: [CUSTOMER_PERSISTENCE_PORT],
    },
    {
      provide: DELIVERY_API,
      useFactory: createDeliveryApi,
      inject: [DELIVERY_PERSISTENCE_PORT, TRANSACTION_PERSISTENCE_PORT],
    },
    {
      provide: ORDER_ITEM_API,
      useFactory: createOrderItemApi,
      inject: [
        ORDER_ITEM_PERSISTENCE_PORT,
        PRODUCT_PERSISTENCE_PORT,
        TRANSACTION_PERSISTENCE_PORT,
      ],
    },
    {
      provide: TRANSACTION_API,
      useFactory: createTransactionApi,
      inject: [
        TRANSACTION_PERSISTENCE_PORT,
        PRODUCT_PERSISTENCE_PORT,
        TRANSACTION_STATUS_PERSISTENCE_PORT,
      ],
    },
    {
      provide: TRANSACTION_STATUS_API,
      useFactory: createTransactionStatusApi,
      inject: [TRANSACTION_STATUS_PERSISTENCE_PORT],
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
