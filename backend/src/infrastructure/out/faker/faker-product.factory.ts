import { Injectable } from '@nestjs/common';

import type { Product } from '../../../../domain/models/product.model';
import type { IProductSeedFactory } from '../../../../domain/spi/product.seed-factory.port';
import { PRODUCT_IMAGE_CATALOG } from './product-image.catalog';

const PRODUCT_VARIANTS = [
  'Classic',
  'Essential',
  'Premium',
  'Portable',
  'Studio',
] as const;

@Injectable()
export class FakerProductFactory implements IProductSeedFactory {
  private readonly fakerPromise = import('@faker-js/faker');

  async create(count: number): Promise<Product[]> {
    const { faker } = await this.fakerPromise;

    return Array.from({ length: count }, () => {
      const template = faker.helpers.arrayElement(PRODUCT_IMAGE_CATALOG);
      const variant = faker.helpers.arrayElement(PRODUCT_VARIANTS);

      return {
        id: faker.string.uuid(),
        name: `${variant} ${template.name}`,
        image: template.image,
        price: faker.number.float({
          min: 10,
          max: 500,
          fractionDigits: 2,
        }),
        quantity: faker.number.int({ min: 1, max: 100 }),
      };
    });
  }
}
