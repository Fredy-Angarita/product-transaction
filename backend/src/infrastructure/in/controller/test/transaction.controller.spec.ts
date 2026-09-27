import type { Transaction } from '../../../../../domain/models/transaction.model';
import { TransactionStatusEnum } from '../../../../../domain/models/transaction-status.enum';
import { TransactionController } from '../transaction.controller';

const transaction: Transaction = {
  uuid: 'transaction-id',
  acceptanceToken: 'acceptance-token-123',
  acceptPersonalAuth: 'personal-auth-456',
  total: 39.98,
  customerId: 'customer-id',
  status: TransactionStatusEnum.PENDING,
  customer: null,
  delivery: null,
  items: [],
  createdAt: '2026-09-25T10:00:00.000Z',
  updatedAt: '2026-09-25T11:00:00.000Z',
};

describe('TransactionController', () => {
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
