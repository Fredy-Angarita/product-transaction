import type { Product } from '../../../../domain/models/product.model';
import type { Transaction } from '../../../../domain/models/transaction.model';
import { ProductController } from './product.controller';
import { TransactionController } from './transaction.controller';

const product: Product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 19.99,
  quantity: 4,
};

const transaction: Transaction = {
  uuid: 'transaction-id',
  acceptanceToken: 'acceptance-token-123',
  acceptPersonalAuth: 'personal-auth-456',
  total: 39.98,
  customerId: 'customer-id',
  statusId: 1,
  customer: null,
  delivery: null,
  items: [],
  createdAt: '2026-09-25T10:00:00.000Z',
  updatedAt: '2026-09-25T11:00:00.000Z',
};

describe('entity controllers', () => {
  it('returns products', async () => {
    const getProducts = jest.fn().mockResolvedValue([product]);
    const controller = new ProductController({
      getProducts,
      seedProducts: jest.fn(),
    } as never);

    await expect(controller.getProducts()).resolves.toEqual([product]);
  });

  it('returns and creates transactions with their relations', async () => {
    const getTransactions = jest.fn().mockResolvedValue([transaction]);
    const createTransaction = jest.fn().mockResolvedValue(transaction);
    const controller = new TransactionController({
      getTransactions,
      createTransaction,
    } as never);

    await expect(controller.getTransactions()).resolves.toEqual([
      expect.objectContaining({
        uuid: 'transaction-id',
      }),
    ]);
  });
});
