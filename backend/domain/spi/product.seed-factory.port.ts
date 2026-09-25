import type { Product } from '../models/product.model';

export const PRODUCT_SEED_FACTORY = Symbol('PRODUCT_SEED_FACTORY');

export interface IProductSeedFactory {
  create(count: number): Promise<Product[]>;
}
