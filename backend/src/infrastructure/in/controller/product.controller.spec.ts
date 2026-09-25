import type { Product } from '../../../../domain/models/product.model';
import { ProductResponseDto } from '../../../../application/dtos/product.response.dto';
import { ProductHandler } from '../../../../application/handlers/product.handler';
import { ProductController } from './product.controller';

const product: Product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 10,
  quantity: 2,
};

describe('ProductController', () => {
  it('returns the products exposed by the handler', async () => {
    const handler = {
      getProducts: jest.fn().mockResolvedValue([product]),
    } as unknown as ProductHandler;
    const controller = new ProductController(handler);

    await expect(controller.getProducts()).resolves.toEqual([
      ProductResponseDto.fromDomain(product),
    ]);
  });

  it('returns an empty list when the handler returns no products', async () => {
    const handler = {
      getProducts: jest.fn().mockResolvedValue([]),
    } as unknown as ProductHandler;
    const controller = new ProductController(handler);

    await expect(controller.getProducts()).resolves.toEqual([]);
  });

  it('returns the number of products inserted by the seed operation', async () => {
    const seedProducts = jest.fn().mockResolvedValue(12);
    const handler = { seedProducts } as unknown as ProductHandler;
    const controller = new ProductController(handler);

    await expect(controller.seedProducts({ count: 12 })).resolves.toEqual({
      inserted: 12,
    });
    expect(seedProducts).toHaveBeenCalledWith(12);
  });

  it('propagates handler errors', async () => {
    const error = new Error('handler unavailable');
    const handler = {
      getProducts: jest.fn().mockRejectedValue(error),
    } as unknown as ProductHandler;
    const controller = new ProductController(handler);

    await expect(controller.getProducts()).rejects.toBe(error);
  });
});
