jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import type { ObjectLiteral, Repository } from 'typeorm';

import { TransactionStatusEnum } from '../../../../../../domain/models/transaction-status.enum';
import { CustomerEntity } from '../../entity/customer.entity';
import { DeliveryEntity } from '../../entity/delivery.entity';
import { OrderItemEntity } from '../../entity/order.item.entity';
import { ProductEntity } from '../../entity/product.entity';
import { TransactionEntity } from '../../entity/transaction.entity';
import { TransactionRepository } from '../transaction.repository';

const customerEntity = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
} as unknown as CustomerEntity;

const productEntity = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: '19.99',
  quantity: 4,
} as unknown as ProductEntity;

const deliveryEntity = {
  id: 'delivery-id',
  country: 'Colombia',
  city: 'Bogotá',
  locality: 'Chapinero',
  subLocality: 'Chapinero Alto',
  address: 'Calle 100 # 10-20',
  postalCode: '110111',
  additionalInfo: 'Apartamento 401',
  transactionId: 'transaction-id',
  transaction: {
    uuid: 'transaction-id',
    paymentReference: 'PAY-1',
    total: '39.98',
  },
} as unknown as DeliveryEntity;

const orderItemEntity = {
  id: 'item-id',
  transactionId: 'transaction-id',
  productId: 'product-id',
  price: '19.99',
  quantity: 2,
  product: productEntity,
} as unknown as OrderItemEntity;

const transactionEntity = {
  uuid: 'transaction-id',
  total: '39.98',
  customerId: 'customer-id',
  customer: customerEntity,
  status: TransactionStatusEnum.PENDING,
  delivery: deliveryEntity,
  items: [orderItemEntity],
  createdAt: new Date('2026-09-25T10:00:00.000Z'),
  updatedAt: new Date('2026-09-25T11:00:00.000Z'),
} as unknown as TransactionEntity;

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

describe('TransactionRepository', () => {
  const createInput = () => ({
    acceptanceToken: 'acceptance-token-123',
    acceptPersonalAuth: 'personal-auth-456',
    total: 39.98,
    status: TransactionStatusEnum.PENDING,
    customerId: 'customer-id',
  });

  it('lists and finds transactions', async () => {
    const {
      find,
      findOne,
      repository: typeOrm,
    } = createTypeOrmRepository<TransactionEntity>();
    find.mockResolvedValue([transactionEntity]);
    findOne.mockResolvedValue(transactionEntity);
    const repository = new TransactionRepository(typeOrm);

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ uuid: 'transaction-id' }),
    ]);
    await expect(repository.getById('transaction-id')).resolves.toEqual(
      expect.objectContaining({ total: 39.98 }),
    );
  });

  it('returns null when a transaction does not exist', async () => {
    const { findOne, repository: typeOrm } =
      createTypeOrmRepository<TransactionEntity>();
    findOne.mockResolvedValue(null);
    const repository = new TransactionRepository(typeOrm);

    await expect(repository.getById('missing')).resolves.toBeNull();
  });

  it('creates a transaction', async () => {
    const { save, repository: typeOrm } =
      createTypeOrmRepository<TransactionEntity>();
    save.mockResolvedValue(transactionEntity);
    const repository = new TransactionRepository(typeOrm);

    await expect(repository.create(createInput())).resolves.toEqual(
      expect.objectContaining({ uuid: 'transaction-id', total: 39.98 }),
    );
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 39.98,
        status: 'PENDING',
        customerId: 'customer-id',
      }),
    );
  });
});
