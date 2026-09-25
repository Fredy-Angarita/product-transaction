jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import type { Repository } from 'typeorm';

import type { Product } from '../../../../../domain/models/product.model';
import { ProductEntity } from '../entity/product.entity';
import { ProductRepository } from './product.repository';

const product: Product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 19.99,
  quantity: 2,
};

const entity = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: '19.99',
  quantity: 2,
} as unknown as ProductEntity;

describe('ProductRepository', () => {
  let find: jest.Mock;
  let save: jest.Mock;
  let repository: ProductRepository;

  beforeEach(() => {
    find = jest.fn();
    save = jest.fn();
    const typeOrmRepository = {
      find,
      save,
    } as unknown as Repository<ProductEntity>;
    repository = new ProductRepository(typeOrmRepository);
  });

  it('returns mapped products', async () => {
    find.mockResolvedValue([entity]);

    await expect(repository.getAll()).resolves.toEqual([product]);
    expect(find).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when no entities are found', async () => {
    find.mockResolvedValue([]);

    await expect(repository.getAll()).resolves.toEqual([]);
  });

  it('propagates errors raised while finding products', async () => {
    const error = new Error('find failed');
    find.mockRejectedValue(error);

    await expect(repository.getAll()).rejects.toBe(error);
  });

  it('maps and saves products', async () => {
    save.mockResolvedValue([]);

    await repository.saveAll([product]);

    expect(save).toHaveBeenCalledWith([
      expect.objectContaining({
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: product.quantity,
      }),
    ]);
  });

  it('propagates errors raised while saving products', async () => {
    const error = new Error('save failed');
    save.mockRejectedValue(error);

    await expect(repository.saveAll([product])).rejects.toBe(error);
  });
});
