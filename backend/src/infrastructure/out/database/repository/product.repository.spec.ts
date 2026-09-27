jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { In, type Repository } from 'typeorm';

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
  let findOne: jest.Mock;
  let save: jest.Mock;
  let repository: ProductRepository;

  beforeEach(() => {
    find = jest.fn();
    findOne = jest.fn();
    save = jest.fn();
    const typeOrmRepository = {
      find,
      findOne,
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

  it('returns a product by id', async () => {
    findOne.mockResolvedValue(entity);

    await expect(repository.getById(product.id)).resolves.toEqual(product);
    expect(findOne).toHaveBeenCalledWith({ where: { id: product.id } });
  });

  it('returns null when a product does not exist', async () => {
    findOne.mockResolvedValue(null);

    await expect(repository.getById('missing')).resolves.toBeNull();
  });

  it('returns multiple products by ids in a single query', async () => {
    find.mockResolvedValue([entity]);

    await expect(
      repository.getByIds(['product-id', 'another-id']),
    ).resolves.toEqual([product]);
    expect(find).toHaveBeenCalledWith({
      where: { id: In(['product-id', 'another-id']) },
    });
  });

  it('returns an empty list when no ids match', async () => {
    find.mockResolvedValue([]);

    await expect(repository.getByIds(['missing'])).resolves.toEqual([]);
    expect(find).toHaveBeenCalledWith({
      where: { id: In(['missing']) },
    });
  });

  it('creates a product and returns the persisted result', async () => {
    save.mockResolvedValue(entity);

    await expect(
      repository.create({
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: product.quantity,
      }),
    ).resolves.toEqual(product);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: product.quantity,
      }),
    );
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
