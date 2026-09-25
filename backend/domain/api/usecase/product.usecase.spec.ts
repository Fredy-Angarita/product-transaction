import type { Product } from '../../models/product.model';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { IProductSeedFactory } from '../../spi/product.seed-factory.port';
import { ProductUseCase } from './product.usecase';

const products: Product[] = [
  {
    id: 'product-id',
    name: 'Product',
    image: 'https://example.com/product.png',
    price: 10,
    quantity: 2,
  },
];

const createSeedFactory = (): jest.Mocked<IProductSeedFactory> => ({
  create: jest.fn(),
});

describe('ProductUseCase', () => {
  it('returns all products from the persistence port', async () => {
    const getAll = jest.fn().mockResolvedValue(products);
    const persistence: jest.Mocked<IProductPersistencePort> = {
      getAll,
      saveAll: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ProductUseCase(persistence, createSeedFactory());

    await expect(useCase.getProducts()).resolves.toEqual(products);
    expect(getAll).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list when there are no products', async () => {
    const getAll = jest.fn().mockResolvedValue([]);
    const persistence: jest.Mocked<IProductPersistencePort> = {
      getAll,
      saveAll: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ProductUseCase(persistence, createSeedFactory());

    await expect(useCase.getProducts()).resolves.toEqual([]);
  });

  it('propagates persistence errors', async () => {
    const error = new Error('database unavailable');
    const persistence: jest.Mocked<IProductPersistencePort> = {
      getAll: jest.fn().mockRejectedValue(error),
      saveAll: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ProductUseCase(persistence, createSeedFactory());

    await expect(useCase.getProducts()).rejects.toBe(error);
  });

  it('does not seed products when products already exist', async () => {
    const create = jest.fn();
    const saveAll = jest.fn().mockResolvedValue(undefined);
    const persistence: jest.Mocked<IProductPersistencePort> = {
      getAll: jest.fn().mockResolvedValue(products),
      saveAll,
    };
    const seedFactory: jest.Mocked<IProductSeedFactory> = { create };
    const useCase = new ProductUseCase(persistence, seedFactory);

    await expect(useCase.seedProducts(30)).resolves.toBe(0);
    expect(create).not.toHaveBeenCalled();
    expect(saveAll).not.toHaveBeenCalled();
  });

  it('generates and saves products when the table is empty', async () => {
    const seededProducts = [
      products[0],
      {
        ...products[0],
        id: 'another-product-id',
      },
    ];
    const create = jest.fn().mockResolvedValue(seededProducts);
    const saveAll = jest.fn().mockResolvedValue(undefined);
    const persistence: jest.Mocked<IProductPersistencePort> = {
      getAll: jest.fn().mockResolvedValue([]),
      saveAll,
    };
    const seedFactory: jest.Mocked<IProductSeedFactory> = { create };
    const useCase = new ProductUseCase(persistence, seedFactory);

    await expect(useCase.seedProducts(2)).resolves.toBe(2);
    expect(create).toHaveBeenCalledWith(2);
    expect(saveAll).toHaveBeenCalledWith(seededProducts);
  });

  it('propagates errors raised while saving seeded products', async () => {
    const error = new Error('save failed');
    const create = jest.fn().mockResolvedValue(products);
    const saveAll = jest.fn().mockRejectedValue(error);
    const persistence: jest.Mocked<IProductPersistencePort> = {
      getAll: jest.fn().mockResolvedValue([]),
      saveAll,
    };
    const seedFactory: jest.Mocked<IProductSeedFactory> = { create };
    const useCase = new ProductUseCase(persistence, seedFactory);

    await expect(useCase.seedProducts(1)).rejects.toBe(error);
  });
});
