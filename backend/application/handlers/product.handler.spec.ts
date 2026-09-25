import type { IProductApi } from '../../domain/api/product.interface';
import type { Product } from '../../domain/models/product.model';
import { ProductHandler } from './product.handler';

const products: Product[] = [
  {
    id: 'product-id',
    name: 'Product',
    image: 'https://example.com/product.png',
    price: 10,
    quantity: 2,
  },
];

describe('ProductHandler', () => {
  it('delegates the request to the product API', async () => {
    const getProducts = jest.fn().mockResolvedValue(products);
    const seedProducts = jest.fn().mockResolvedValue(0);
    const productApi: jest.Mocked<IProductApi> = { getProducts, seedProducts };
    const handler = new ProductHandler(productApi);

    await expect(handler.getProducts()).resolves.toEqual(products);
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  it('delegates product seeding to the product API', async () => {
    const seedProducts = jest.fn().mockResolvedValue(10);
    const productApi: jest.Mocked<IProductApi> = {
      getProducts: jest.fn().mockResolvedValue(products),
      seedProducts,
    };
    const handler = new ProductHandler(productApi);

    await expect(handler.seedProducts(10)).resolves.toBe(10);
    expect(seedProducts).toHaveBeenCalledWith(10);
  });

  it('propagates API errors', async () => {
    const error = new Error('api unavailable');
    const productApi: jest.Mocked<IProductApi> = {
      getProducts: jest.fn().mockRejectedValue(error),
      seedProducts: jest.fn().mockResolvedValue(0),
    };
    const handler = new ProductHandler(productApi);

    await expect(handler.getProducts()).rejects.toBe(error);
  });
});
