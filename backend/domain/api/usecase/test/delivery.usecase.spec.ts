/* eslint-disable @typescript-eslint/unbound-method */
import { ResourceNotFoundError } from '../../../errors/resource-not-found.error';
import type { Delivery } from '../../../models/delivery.model';
import type { Transaction } from '../../../models/transaction.model';
import type { IDeliveryPersistencePort } from '../../../spi/delivery.persistence.port';
import type { ITransactionPersistencePort } from '../../../spi/transaction.persistence.port';
import { DeliveryUseCase } from '../delivery.usecase';

const transaction = { uuid: 'transaction-id' } as Transaction;
const delivery = { id: 'delivery-id' } as Delivery;

const deliveryInput = {
  country: 'Colombia',
  city: 'Bogotá',
  locality: 'Chapinero',
  subLocality: 'Chapinero Alto',
  address: 'Calle 100 # 10-20',
  postalCode: '110111',
  additionalInfo: 'Apartamento 401',
};

const createDeliveryInput = (transactionId: string | null) => ({
  ...deliveryInput,
  transactionId,
});

const createDeliveryPersistence =
  (): jest.Mocked<IDeliveryPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([delivery]),
    create: jest.fn().mockResolvedValue(delivery),
  });

const createTransactionPersistence =
  (): jest.Mocked<ITransactionPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([transaction]),
    getById: jest.fn().mockResolvedValue(transaction),
    create: jest.fn().mockResolvedValue(transaction),
    updateStatus: jest.fn().mockResolvedValue(undefined),
  });

describe('DeliveryUseCase', () => {
  it('lists deliveries', async () => {
    const useCase = new DeliveryUseCase(
      createDeliveryPersistence(),
      createTransactionPersistence(),
    );

    await expect(useCase.getDeliveries()).resolves.toEqual([delivery]);
  });

  it('creates a delivery without a transaction', async () => {
    const deliveryPersistence = createDeliveryPersistence();
    const transactionPersistence = createTransactionPersistence();
    const useCase = new DeliveryUseCase(
      deliveryPersistence,
      transactionPersistence,
    );
    const input = createDeliveryInput(null);

    await expect(useCase.createDelivery(input)).resolves.toEqual(delivery);
    expect(transactionPersistence.getById).not.toHaveBeenCalled();
  });

  it('validates the transaction before creating a delivery', async () => {
    const deliveryPersistence = createDeliveryPersistence();
    const transactionPersistence = createTransactionPersistence();
    const useCase = new DeliveryUseCase(
      deliveryPersistence,
      transactionPersistence,
    );

    await useCase.createDelivery(createDeliveryInput('transaction-id'));

    expect(transactionPersistence.getById).toHaveBeenCalledWith(
      'transaction-id',
    );
    expect(deliveryPersistence.create).toHaveBeenCalled();
  });

  it('rejects a delivery when its transaction does not exist', async () => {
    const deliveryPersistence = createDeliveryPersistence();
    const transactionPersistence = createTransactionPersistence();
    transactionPersistence.getById.mockResolvedValue(null);
    const useCase = new DeliveryUseCase(
      deliveryPersistence,
      transactionPersistence,
    );

    await expect(
      useCase.createDelivery(createDeliveryInput('missing')),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(deliveryPersistence.create).not.toHaveBeenCalled();
  });
});
