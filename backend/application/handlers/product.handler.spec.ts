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

const createProductApi = (
  overrides: Partial<jest.Mocked<IProductApi>> = {},
): jest.Mocked<IProductApi> => ({
  getProducts: jest.fn().mockResolvedValue(products),
  createProduct: jest.fn().mockResolvedValue(products[0]),
  seedProducts: jest.fn().mockResolvedValue(0),
  ...overrides,
});

describe('ProductHandler', () => {
  it('delegates the request to the product API', async () => {
    const getProducts = jest.fn().mockResolvedValue(products);
    const handler = new ProductHandler(createProductApi({ getProducts }));

    await expect(handler.getProducts()).resolves.toEqual(products);
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  it('delegates product creation to the product API', async () => {
    const input = {
      name: 'New product',
      image: 'https://example.com/new-product.png',
      price: 25,
      quantity: 3,
    };
    const createProduct = jest
      .fn()
      .mockResolvedValue({ id: 'new-id', ...input });
    const handler = new ProductHandler(createProductApi({ createProduct }));

    await expect(handler.createProduct(input)).resolves.toEqual({
      id: 'new-id',
      ...input,
    });
    expect(createProduct).toHaveBeenCalledWith(input);
  });

  it('delegates product seeding to the product API', async () => {
    const seedProducts = jest.fn().mockResolvedValue(10);
    const handler = new ProductHandler(createProductApi({ seedProducts }));

    await expect(handler.seedProducts(10)).resolves.toBe(10);
    expect(seedProducts).toHaveBeenCalledWith(10);
  });

  it('propagates API errors', async () => {
    const error = new Error('api unavailable');
    const getProducts = jest.fn().mockRejectedValue(error);
    const handler = new ProductHandler(createProductApi({ getProducts }));

    await expect(handler.getProducts()).rejects.toBe(error);
  });
});
