jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import type { ObjectLiteral, Repository } from 'typeorm';

import { OrderItemEntity } from '../../entity/order.item.entity';
import { ProductEntity } from '../../entity/product.entity';
import { OrderItemRepository } from '../order-item.repository';

const productEntity = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: '19.99',
  quantity: 4,
} as unknown as ProductEntity;

const orderItemEntity = {
  id: 'item-id',
  transactionId: 'transaction-id',
  productId: 'product-id',
  price: '19.99',
  quantity: 2,
  product: productEntity,
} as unknown as OrderItemEntity;

const createTypeOrmRepository = <T extends ObjectLiteral>(): {
  find: jest.Mock;
  findOne: jest.Mock;
  save: jest.Mock;
  repository: Repository<T>;
} => {
  const find = jest.fn();
  const findOne = jest.fn();
  const save = jest.fn();
  return {
    find,
    findOne,
    save,
    repository: { find, findOne, save } as unknown as Repository<T>,
  };
};

describe('OrderItemRepository', () => {
  it('lists and creates order items', async () => {
    const {
      find,
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<OrderItemEntity>();
    find.mockResolvedValue([orderItemEntity]);
    findOne.mockResolvedValue(orderItemEntity);
    save.mockResolvedValue(orderItemEntity);
    const repository = new OrderItemRepository(typeOrm);
    const input = {
      transactionId: orderItemEntity.transactionId,
      productId: orderItemEntity.productId,
      price: 19.99,
      quantity: 2,
    };

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ id: orderItemEntity.id }),
    ]);
    await expect(repository.create(input)).resolves.toEqual(
      expect.objectContaining(input),
    );
  });

  it('saves all order items in a single query', async () => {
    const { repository: typeOrm } = createTypeOrmRepository<OrderItemEntity>();
    const save = jest.fn().mockResolvedValue([orderItemEntity]);
    typeOrm.save = save;
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    await new OrderItemRepository(typeOrm).saveAll([input]);

    expect(save).toHaveBeenCalledWith([expect.objectContaining(input)]);
  });

  it('returns null when an order item does not exist', async () => {
    const { findOne, repository: typeOrm } =
      createTypeOrmRepository<OrderItemEntity>();
    findOne.mockResolvedValue(null);

    await expect(
      new OrderItemRepository(typeOrm).getById('missing'),
    ).resolves.toBeNull();
  });

  it('returns the saved order item when it cannot be reloaded', async () => {
    const {
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<OrderItemEntity>();
    findOne.mockResolvedValue(null);
    save.mockResolvedValue({ ...orderItemEntity, product: null });
    const input = {
      transactionId: orderItemEntity.transactionId,
      productId: orderItemEntity.productId,
      price: 19.99,
      quantity: 2,
    };

    await expect(
      new OrderItemRepository(typeOrm).create(input),
    ).resolves.toEqual(expect.objectContaining({ id: orderItemEntity.id }));
  });
});
