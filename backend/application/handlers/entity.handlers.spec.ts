import type { ITransactionApi } from '../../domain/api/transaction.interface';
import type { Transaction } from '../../domain/models/transaction.model';
import { TransactionHandler } from './transaction.handler';

const transaction = { uuid: 'transaction-id' } as Transaction;

describe('entity handlers', () => {
  it('delegates transaction operations', async () => {
    const getTransactions = jest.fn().mockResolvedValue([transaction]);
    const createTransaction = jest.fn().mockResolvedValue(transaction);
    const api: jest.Mocked<ITransactionApi> = {
      getTransactions,
      createTransaction,
    };
    const handler = new TransactionHandler(api);

    await expect(handler.getTransactions()).resolves.toEqual([transaction]);
    await expect(
      handler.createTransaction({
        acceptanceToken: 'token',
        acceptPersonalAuth: 'auth',
        customer: {
          name: 'Ana',
          lastName: 'Gómez',
          identificationNumber: '123456789',
          email: 'ana@example.com',
        },
        delivery: {
          country: 'Colombia',
          city: 'Bogotá',
          locality: 'Chapinero',
          subLocality: 'Chapinero Alto',
          address: 'Calle 100 # 10-20',
          postalCode: '110111',
          additionalInfo: 'Apartamento 401',
          fee: 1500,
        },
        items: [{ productId: 'product-id', quantity: 2 }],
        card: {
          number: '4242424242424242',
          cvc: '123',
          exp_month: '08',
          exp_year: '28',
          card_holder: 'Test User',
        },
      }),
    ).resolves.toEqual(transaction);
    expect(createTransaction).toHaveBeenCalledTimes(1);
  });
});
