/* eslint-disable @typescript-eslint/unbound-method */
import { ResourceNotFoundError } from '../../../errors/resource-not-found.error';
import type { OrderItem } from '../../../models/order-item.model';
import type { Product } from '../../../models/product.model';
import type { Transaction } from '../../../models/transaction.model';
import type { IOrderItemPersistencePort } from '../../../spi/order-item.persistence.port';
import type { IProductPersistencePort } from '../../../spi/product.persistence.port';
import type { ITransactionPersistencePort } from '../../../spi/transaction.persistence.port';
import { OrderItemUseCase } from '../order-item.usecase';

const product: Product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 20000,
  quantity: 10,
};
const transaction = { uuid: 'transaction-id' } as Transaction;
const orderItem = { id: 'item-id' } as OrderItem;

const createProductPersistence = (): jest.Mocked<IProductPersistencePort> => ({
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue(product),
  getByIds: jest.fn().mockResolvedValue([product]),
  saveAll: jest.fn().mockResolvedValue(undefined),
  updateStock: jest.fn().mockResolvedValue(undefined),
});

const createTransactionPersistence =
  (): jest.Mocked<ITransactionPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([transaction]),
    getById: jest.fn().mockResolvedValue(transaction),
    create: jest.fn().mockResolvedValue(transaction),
    updateStatus: jest.fn().mockResolvedValue(undefined),
  });

const createOrderItemPersistence =
  (): jest.Mocked<IOrderItemPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([orderItem]),
    getById: jest.fn().mockResolvedValue(orderItem),
    create: jest.fn().mockResolvedValue(orderItem),
    saveAll: jest.fn().mockResolvedValue([orderItem]),
  });

describe('OrderItemUseCase', () => {
  it('lists and creates order items after validating relations', async () => {
    const orderItemPersistence = createOrderItemPersistence();
    const productPersistence = createProductPersistence();
    const transactionPersistence = createTransactionPersistence();
    const useCase = new OrderItemUseCase(
      orderItemPersistence,
      productPersistence,
      transactionPersistence,
    );
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    await expect(useCase.getOrderItems()).resolves.toEqual([orderItem]);
    await expect(useCase.createOrderItem(input)).resolves.toEqual(orderItem);
    expect(productPersistence.getById).toHaveBeenCalledWith('product-id');
    expect(transactionPersistence.getById).toHaveBeenCalledWith(
      'transaction-id',
    );
    expect(orderItemPersistence.create).toHaveBeenCalledWith(input);
  });

  it('rejects an order item when its product does not exist', async () => {
    const orderItemPersistence = createOrderItemPersistence();
    const productPersistence = createProductPersistence();
    const transactionPersistence = createTransactionPersistence();
    productPersistence.getById.mockResolvedValue(null);
    const useCase = new OrderItemUseCase(
      orderItemPersistence,
      productPersistence,
      transactionPersistence,
    );

    await expect(
      useCase.createOrderItem({
        transactionId: 'transaction-id',
        productId: 'missing',
        price: 19.99,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(orderItemPersistence.create).not.toHaveBeenCalled();
  });

  it('rejects an order item when its transaction does not exist', async () => {
    const orderItemPersistence = createOrderItemPersistence();
    const productPersistence = createProductPersistence();
    const transactionPersistence = createTransactionPersistence();
    transactionPersistence.getById.mockResolvedValue(null);
    const useCase = new OrderItemUseCase(
      orderItemPersistence,
      productPersistence,
      transactionPersistence,
    );

    await expect(
      useCase.createOrderItem({
        transactionId: 'missing',
        productId: 'product-id',
        price: 19.99,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(orderItemPersistence.create).not.toHaveBeenCalled();
  });
});
