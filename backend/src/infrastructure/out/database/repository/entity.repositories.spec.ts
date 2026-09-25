jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import type {
  DataSource,
  EntityManager,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { InsufficientStockError } from '../../../../../domain/errors/insufficient-stock.error';

import { CustomerEntity } from '../entity/customer.entity';
import { DeliveryEntity } from '../entity/delivery.entity';
import { OrderItemEntity } from '../entity/order.item.entity';
import { ProductEntity } from '../entity/product.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { TransactionEntity } from '../entity/transaction.entity';
import { CustomerRepository } from './customer.repository';
import { DeliveryRepository } from './delivery.repository';
import { OrderItemRepository } from './order-item.repository';
import { TransactionRepository } from './transaction.repository';
import { TransactionStatusRepository } from './transaction-status.repository';

const customerEntity = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
} as unknown as CustomerEntity;

const customerInput = {
  name: customerEntity.name,
  lastName: customerEntity.lastName,
  identificationNumber: customerEntity.identificationNumber,
  email: customerEntity.email,
};

const statusEntity = {
  id: 1,
  status: 'PENDING',
} as unknown as TransactionStatusEntity;

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
  paymentReference: 'PAY-1',
  total: '39.98',
  customerId: 'customer-id',
  statusId: 1,
  customer: customerEntity,
  status: statusEntity,
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

describe('CustomerRepository', () => {
  it('lists and creates customers', async () => {
    const {
      find,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<CustomerEntity>();
    find.mockResolvedValue([customerEntity]);
    save.mockResolvedValue(customerEntity);
    const repository = new CustomerRepository(typeOrm);

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ id: customerEntity.id }),
    ]);
    await expect(repository.create(customerInput)).resolves.toEqual(
      expect.objectContaining(customerInput),
    );
    expect(save).toHaveBeenCalledWith(expect.objectContaining(customerInput));
  });
});

describe('TransactionStatusRepository', () => {
  it('lists, finds and creates statuses', async () => {
    const {
      find,
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<TransactionStatusEntity>();
    find.mockResolvedValue([statusEntity]);
    findOne.mockResolvedValue(statusEntity);
    save.mockResolvedValue(statusEntity);
    const repository = new TransactionStatusRepository(typeOrm);

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ id: 1 }),
    ]);
    await expect(repository.getById(1)).resolves.toEqual(
      expect.objectContaining({ status: 'PENDING' }),
    );
    await expect(repository.create({ status: 'PENDING' })).resolves.toEqual(
      expect.objectContaining({ status: 'PENDING' }),
    );
  });

  it('returns null when a status does not exist', async () => {
    const { findOne, repository: typeOrm } =
      createTypeOrmRepository<TransactionStatusEntity>();
    findOne.mockResolvedValue(null);

    await expect(
      new TransactionStatusRepository(typeOrm).getById(99),
    ).resolves.toBeNull();
  });
});

describe('DeliveryRepository', () => {
  it('lists and creates deliveries', async () => {
    const {
      find,
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<DeliveryEntity>();
    find.mockResolvedValue([deliveryEntity]);
    findOne.mockResolvedValue(deliveryEntity);
    save.mockResolvedValue(deliveryEntity);
    const repository = new DeliveryRepository(typeOrm);
    const input = {
      country: deliveryEntity.country,
      city: deliveryEntity.city,
      locality: deliveryEntity.locality,
      subLocality: deliveryEntity.subLocality,
      address: deliveryEntity.address,
      postalCode: deliveryEntity.postalCode,
      additionalInfo: deliveryEntity.additionalInfo,
      transactionId: deliveryEntity.transactionId,
    };

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ id: deliveryEntity.id }),
    ]);
    await expect(repository.create(input)).resolves.toEqual(
      expect.objectContaining(input),
    );
  });

  it('returns null when a delivery does not exist', async () => {
    const { findOne, repository: typeOrm } =
      createTypeOrmRepository<DeliveryEntity>();
    findOne.mockResolvedValue(null);

    await expect(
      new DeliveryRepository(typeOrm).getById('missing'),
    ).resolves.toBeNull();
  });

  it('returns the saved delivery when it cannot be reloaded', async () => {
    const {
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<DeliveryEntity>();
    findOne.mockResolvedValue(null);
    save.mockResolvedValue({ ...deliveryEntity, transaction: null });
    const input = {
      country: deliveryEntity.country,
      city: deliveryEntity.city,
      locality: deliveryEntity.locality,
      subLocality: deliveryEntity.subLocality,
      address: deliveryEntity.address,
      postalCode: deliveryEntity.postalCode,
      additionalInfo: deliveryEntity.additionalInfo,
      transactionId: deliveryEntity.transactionId,
    };

    await expect(
      new DeliveryRepository(typeOrm).create(input),
    ).resolves.toEqual(
      expect.objectContaining({ id: deliveryEntity.id, transaction: null }),
    );
  });
});

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

  it('saves all order items with the provided transaction manager', async () => {
    const { repository: typeOrm } = createTypeOrmRepository<OrderItemEntity>();
    const save = jest.fn().mockResolvedValue([orderItemEntity]);
    const manager = { save } as unknown as EntityManager;
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    await expect(
      new OrderItemRepository(typeOrm).saveAll(manager, [input]),
    ).resolves.toEqual([orderItemEntity]);
    expect(save).toHaveBeenCalledWith(OrderItemEntity, [
      expect.objectContaining(input),
    ]);
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

describe('TransactionRepository', () => {
  const createInput = () => ({
    paymentReference: 'PAY-1',
    total: 39.98,
    statusId: 1,
    customer: customerInput,
    delivery: {
      country: deliveryEntity.country,
      city: deliveryEntity.city,
      locality: deliveryEntity.locality,
      subLocality: deliveryEntity.subLocality,
      address: deliveryEntity.address,
      postalCode: deliveryEntity.postalCode,
      additionalInfo: deliveryEntity.additionalInfo,
    },
    items: [{ productId: 'product-id', price: 19.99, quantity: 2 }],
  });

  const createAggregate = () => {
    const decrement = jest.fn().mockResolvedValue({ affected: 1 });
    const findOneBy = jest.fn().mockResolvedValue(statusEntity);
    const save = jest
      .fn()
      .mockResolvedValueOnce(customerEntity)
      .mockResolvedValueOnce(transactionEntity)
      .mockResolvedValueOnce(deliveryEntity);
    const findBy = jest.fn().mockResolvedValue([productEntity]);
    const findOne = jest.fn().mockResolvedValue(transactionEntity);
    const manager = {
      decrement,
      findOneBy,
      save,
      findBy,
      findOne,
    } as unknown as EntityManager;
    const saveAll = jest.fn().mockResolvedValue([orderItemEntity]);
    const orderItemRepository = {
      saveAll,
    } as unknown as OrderItemRepository;
    const dataSource = {
      transaction: jest.fn(
        async (callback: (entityManager: EntityManager) => Promise<unknown>) =>
          callback(manager),
      ),
    } as unknown as DataSource;

    return {
      decrement,
      findOneBy,
      save,
      findBy,
      findOne,
      saveAll,
      manager,
      dataSource,
      orderItemRepository,
    };
  };

  it('lists and finds transactions', async () => {
    const {
      find,
      findOne,
      repository: typeOrm,
    } = createTypeOrmRepository<TransactionEntity>();
    const aggregate = createAggregate();
    const repository = new TransactionRepository(
      typeOrm,
      aggregate.dataSource,
      aggregate.orderItemRepository,
    );
    find.mockResolvedValue([transactionEntity]);
    findOne.mockResolvedValue(transactionEntity);

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
    const aggregate = createAggregate();
    findOne.mockResolvedValue(null);

    await expect(
      new TransactionRepository(
        typeOrm,
        aggregate.dataSource,
        aggregate.orderItemRepository,
      ).getById('missing'),
    ).resolves.toBeNull();
  });

  it('creates the aggregate and reloads it with relations', async () => {
    const { repository: typeOrm } =
      createTypeOrmRepository<TransactionEntity>();
    const aggregate = createAggregate();
    const repository = new TransactionRepository(
      typeOrm,
      aggregate.dataSource,
      aggregate.orderItemRepository,
    );

    await expect(repository.create(createInput())).resolves.toEqual(
      expect.objectContaining({ uuid: 'transaction-id', total: 39.98 }),
    );
    expect(aggregate.decrement).toHaveBeenCalledWith(
      ProductEntity,
      expect.objectContaining({ id: 'product-id' }),
      'quantity',
      2,
    );
    expect(aggregate.saveAll).toHaveBeenCalledWith(aggregate.manager, [
      expect.objectContaining({
        transactionId: 'transaction-id',
        productId: 'product-id',
        price: 19.99,
        quantity: 2,
      }),
    ]);
  });

  it('returns the assembled aggregate when it cannot be reloaded', async () => {
    const { repository: typeOrm } =
      createTypeOrmRepository<TransactionEntity>();
    const aggregate = createAggregate();
    aggregate.findOne.mockResolvedValue(null);
    const repository = new TransactionRepository(
      typeOrm,
      aggregate.dataSource,
      aggregate.orderItemRepository,
    );

    const result = await repository.create(createInput());

    expect(result.uuid).toBe('transaction-id');
    expect(result.customer?.id).toBe('customer-id');
    expect(result.status?.id).toBe(1);
    expect(result.delivery?.id).toBe('delivery-id');
    expect(result.items[0]?.id).toBe('item-id');
  });

  it('rejects and rolls back when atomic stock reservation fails', async () => {
    const { repository: typeOrm } =
      createTypeOrmRepository<TransactionEntity>();
    const aggregate = createAggregate();
    aggregate.decrement.mockResolvedValue({ affected: 0 });
    aggregate.findOneBy.mockResolvedValue({ ...productEntity, quantity: 1 });
    const repository = new TransactionRepository(
      typeOrm,
      aggregate.dataSource,
      aggregate.orderItemRepository,
    );

    await expect(repository.create(createInput())).rejects.toBeInstanceOf(
      InsufficientStockError,
    );
    expect(aggregate.save).not.toHaveBeenCalled();
    expect(aggregate.saveAll).not.toHaveBeenCalled();
  });
});
