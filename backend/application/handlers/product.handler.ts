import { Inject, Injectable } from '@nestjs/common';

import { PRODUCT_API } from '../../domain/api/product.interface';
import type { IProductApi } from '../../domain/api/product.interface';
import type { Product } from '../../domain/models/product.model';

@Injectable()
export class ProductHandler {
  constructor(
    @Inject(PRODUCT_API)
    private readonly productApi: IProductApi,
  ) {}

  getProducts(): Promise<Product[]> {
    return this.productApi.getProducts();
  }

  seedProducts(count: number): Promise<number> {
    return this.productApi.seedProducts(count);
  }
}
