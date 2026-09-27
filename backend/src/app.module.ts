import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { ProductHandler } from '../application/handlers/product.handler';
import { TransactionHandler } from '../application/handlers/transaction.handler';
import { WompiHandler } from '../application/handlers/wompi.handler';
import { PRODUCT_API } from '../domain/api/product.interface';
import type { IProductApi } from '../domain/api/product.interface';
import { TRANSACTION_API } from '../domain/api/transaction.interface';
import type { ITransactionApi } from '../domain/api/transaction.interface';
import { ProductUseCase } from '../domain/api/usecase/product.usecase';
import { TransactionUseCase } from '../domain/api/usecase/transaction.usecase';
import { WompiUseCase } from '../domain/api/usecase/wompi.usecase';
import { WOMPI_API } from '../domain/api/wompi.interface';
import type { IWompiApi } from '../domain/api/wompi.interface';
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
import { WOMPI_PAYMENT_PORT } from '../domain/spi/wompi.payment.port';
import type { IWompiPaymentPort } from '../domain/spi/wompi.payment.port';
import { PRODUCT_SEED_FACTORY } from '../domain/spi/product.seed-factory.port';
import type { IProductSeedFactory } from '../domain/spi/product.seed-factory.port';
import { ProductController } from './infrastructure/in/controller/product.controller';
import { DomainExceptionFilter } from './infrastructure/in/filters/domain-exception.filter';
import { TransactionController } from './infrastructure/in/controller/transaction.controller';
import { WompiController } from './infrastructure/in/controller/wompi.controller';
import { DatabaseModule } from './infrastructure/out/database/database.module';
import { WompiModule } from './infrastructure/out/external/wompi/wompi.module';
import { FakerProductFactory } from './infrastructure/out/faker/faker-product.factory';
import { CALCULATE_FEE_API } from '../domain/api/calculate-fee.interface';
import type { ICalculateFeeApi } from '../domain/api/calculate-fee.interface';
import { CalculateFeeUseCase } from '../domain/api/usecase/calculate-fee.usecase';

const createProductApi = (
  productPersistence: IProductPersistencePort,
  productSeedFactory: IProductSeedFactory,
): IProductApi => new ProductUseCase(productPersistence, productSeedFactory);

const createTransactionApi = (
  transactionPersistence: ITransactionPersistencePort,
  productPersistence: IProductPersistencePort,
  wompiUseCase: IWompiApi,
  deliveryPersistence: IDeliveryPersistencePort,
  orderItemPersistence: IOrderItemPersistencePort,
  customerPersistence: ICustomerPersistencePort,
  deliveryFee: ICalculateFeeApi,
): ITransactionApi =>
  new TransactionUseCase(
    transactionPersistence,
    productPersistence,
    wompiUseCase,
    deliveryPersistence,
    orderItemPersistence,
    customerPersistence,
    deliveryFee,
  );

const createWompiApi = (wompiPayment: IWompiPaymentPort): IWompiApi =>
  new WompiUseCase(wompiPayment);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    DatabaseModule,
    WompiModule,
  ],
  controllers: [ProductController, TransactionController, WompiController],
  providers: [
    FakerProductFactory,
    ProductHandler,
    TransactionHandler,
    WompiHandler,
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
      provide: WOMPI_API,
      useFactory: createWompiApi,
      inject: [WOMPI_PAYMENT_PORT],
    },
    {
      provide: TRANSACTION_API,
      useFactory: createTransactionApi,
      inject: [
        TRANSACTION_PERSISTENCE_PORT,
        PRODUCT_PERSISTENCE_PORT,
        WOMPI_API,
        DELIVERY_PERSISTENCE_PORT,
        ORDER_ITEM_PERSISTENCE_PORT,
        CUSTOMER_PERSISTENCE_PORT,
        CALCULATE_FEE_API,
      ],
    },
    {
      provide: CALCULATE_FEE_API,
      useClass: CalculateFeeUseCase,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}
