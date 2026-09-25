import { Product } from '../models/product.model';

export const PRODUCT_API = Symbol('PRODUCT_API');

export interface IProductApi {
  getProducts(): Promise<Product[]>;
  seedProducts(count: number): Promise<number>;
}
