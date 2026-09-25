import type { CreateProductInput, Product } from '../../models/product.model';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { IProductSeedFactory } from '../../spi/product.seed-factory.port';
import type { IProductApi } from '../product.interface';

export class ProductUseCase implements IProductApi {
  constructor(
    private readonly productPersistence: IProductPersistencePort,
    private readonly productSeedFactory: IProductSeedFactory,
  ) {}

  getProducts(): Promise<Product[]> {
    return this.productPersistence.getAll();
  }

  createProduct(input: CreateProductInput): Promise<Product> {
    return this.productPersistence.create(input);
  }

  async seedProducts(count: number): Promise<number> {
    const existingProducts = await this.productPersistence.getAll();

    if (existingProducts.length > 0) {
      return 0;
    }

    const products = await this.productSeedFactory.create(count);
    await this.productPersistence.saveAll(products);

    return products.length;
  }
}
