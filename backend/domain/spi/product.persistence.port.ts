import type { CreateProductInput, Product } from '../models/product.model';

export const PRODUCT_PERSISTENCE_PORT = Symbol('PRODUCT_PERSISTENCE_PORT');

export interface IProductPersistencePort {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getByIds(ids: string[]): Promise<Product[]>;
  create(input: CreateProductInput): Promise<Product>;
  saveAll(products: Product[]): Promise<void>;
}
