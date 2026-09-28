import type { Customer } from '../../../../../../domain/models/customer.model';
import { TransactionStatusEnum } from '../../../../../../domain/models/transaction-status.enum';
import { CustomerEntity } from '../../entity/customer.entity';
import { DeliveryEntity } from '../../entity/delivery.entity';
import { OrderItemEntity } from '../../entity/order.item.entity';
import { ProductEntity } from '../../entity/product.entity';
import { TransactionEntity } from '../../entity/transaction.entity';
import { TransactionMapper } from '../transaction.mapper';

const customer: Customer = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
};

const customerEntity = customer as unknown as CustomerEntity;

const product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 19.99,
  quantity: 4,
} as unknown as ProductEntity;

const orderItem = {
  id: 'item-id',
  transactionId: 'transaction-id',
  productId: product.id,
  price: '19.99',
  quantity: 2,
  product,
} as unknown as OrderItemEntity;

const delivery = {
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
    total: '39.98',
  },
} as unknown as DeliveryEntity;

const transaction = {
  uuid: 'transaction-id',
  total: '39.98',
  customerId: customer.id,
  status: 'PENDING',
  customer: customerEntity,
  delivery,
  items: [orderItem],
  createdAt: new Date('2026-09-25T10:00:00.000Z'),
  updatedAt: new Date('2026-09-25T11:00:00.000Z'),
} as unknown as TransactionEntity;

describe('TransactionMapper', () => {
  it('maps a complete transaction to the domain', () => {
    const result = TransactionMapper.toDomain(transaction);

    expect(result.uuid).toBe('transaction-id');
    expect(result.total).toBe(39.98);
    expect(result.customerId).toBe('customer-id');
    expect(result.status).toBe('PENDING');
    expect(result.customer).toEqual(customer);
    expect(result.delivery?.id).toBe('delivery-id');
    expect(result.items[0]?.id).toBe('item-id');
    expect(result.items[0]?.price).toBe(19.99);
    expect(result.createdAt).toBe('2026-09-25T10:00:00.000Z');
    expect(result.updatedAt).toBe('2026-09-25T11:00:00.000Z');
  });

  it('maps a transaction without optional relations', () => {
    const entity = {
      ...transaction,
      customer: null,
      delivery: null,
      items: undefined,
    } as unknown as TransactionEntity;

    expect(TransactionMapper.toDomain(entity)).toEqual(
      expect.objectContaining({
        customer: null,
        status: 'PENDING',
        delivery: null,
        items: [],
      }),
    );
  });

  it('maps transaction input to an entity', () => {
    const input = {
      acceptanceToken: 'acceptance-token-123',
      acceptPersonalAuth: 'personal-auth-456',
      total: 39.98,
      status: TransactionStatusEnum.PENDING,
      customerId: 'customer-id',
    };

    expect(TransactionMapper.toEntity(input)).toEqual(
      expect.objectContaining(input),
    );
  });
});
