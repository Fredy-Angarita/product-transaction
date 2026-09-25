import { Product } from '../models/product.model';

export const PRODUCT_PERSISTENCE_PORT = Symbol('PRODUCT_PERSISTENCE_PORT');

export interface IProductPersistencePort {
  getAll(): Promise<Product[]>;
  saveAll(products: Product[]): Promise<void>;
}
