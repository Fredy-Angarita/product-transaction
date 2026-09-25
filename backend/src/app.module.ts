import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProductHandler } from '../application/handlers/product.handler';
import { PRODUCT_API } from '../domain/api/product.interface';
import type { IProductApi } from '../domain/api/product.interface';
import { ProductUseCase } from '../domain/api/usecase/product.usecase';
import { PRODUCT_PERSISTENCE_PORT } from '../domain/spi/product.persistence.port';
import type { IProductPersistencePort } from '../domain/spi/product.persistence.port';
import { PRODUCT_SEED_FACTORY } from '../domain/spi/product.seed-factory.port';
import type { IProductSeedFactory } from '../domain/spi/product.seed-factory.port';
import { ProductController } from './infrastructure/in/controller/product.controller';
import { DatabaseModule } from './infrastructure/out/database/database.module';
import { FakerProductFactory } from './infrastructure/out/faker/faker-product.factory';

const createProductApi = (
  productPersistence: IProductPersistencePort,
  productSeedFactory: IProductSeedFactory,
): IProductApi => new ProductUseCase(productPersistence, productSeedFactory);

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [ProductController],
  providers: [
    FakerProductFactory,
    {
      provide: PRODUCT_SEED_FACTORY,
      useExisting: FakerProductFactory,
    },
    {
      provide: PRODUCT_API,
      useFactory: createProductApi,
      inject: [PRODUCT_PERSISTENCE_PORT, PRODUCT_SEED_FACTORY],
    },
    ProductHandler,
  ],
})
export class AppModule {}
