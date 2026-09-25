import type {
  CreateCustomerInput,
  Customer,
} from '../../../../../domain/models/customer.model';
import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../../../../../domain/models/transaction-status.model';
import { CustomerEntity } from '../entity/customer.entity';
import { DeliveryEntity } from '../entity/delivery.entity';
import { OrderItemEntity } from '../entity/order.item.entity';
import { ProductEntity } from '../entity/product.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { TransactionEntity } from '../entity/transaction.entity';
import { CustomerMapper } from './customer.mapper';
import { DeliveryMapper } from './delivery.mapper';
import { OrderItemMapper } from './order-item.mapper';
import { TransactionStatusMapper } from './transaction-status.mapper';
import { TransactionMapper } from './transaction.mapper';

const customerInput: CreateCustomerInput = {
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
};

const customer: Customer = { id: 'customer-id', ...customerInput };
const customerEntity = customer as unknown as CustomerEntity;

const statusInput: CreateTransactionStatusInput = { status: 'PENDING' };
const status: TransactionStatus = { id: 1, ...statusInput };
const statusEntity = status as unknown as TransactionStatusEntity;

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
    paymentReference: 'PAY-1',
    total: '39.98',
  },
} as unknown as DeliveryEntity;

const transaction = {
  uuid: 'transaction-id',
  paymentReference: 'PAY-1',
  total: '39.98',
  customerId: customer.id,
  statusId: status.id,
  customer: customerEntity,
  status: statusEntity,
  delivery,
  items: [orderItem],
  createdAt: new Date('2026-09-25T10:00:00.000Z'),
  updatedAt: new Date('2026-09-25T11:00:00.000Z'),
} as unknown as TransactionEntity;

describe('CustomerMapper', () => {
  it('maps a customer entity to the domain and back', () => {
    expect(CustomerMapper.toDomain(customerEntity)).toEqual(customer);
    expect(CustomerMapper.toEntity(customerInput)).toEqual(
      expect.objectContaining(customerInput),
    );
  });
});

describe('TransactionStatusMapper', () => {
  it('maps a status entity to the domain and back', () => {
    expect(TransactionStatusMapper.toDomain(statusEntity)).toEqual(status);
    expect(TransactionStatusMapper.toEntity(statusInput)).toEqual(
      expect.objectContaining(statusInput),
    );
  });
});

describe('DeliveryMapper', () => {
  it('maps a delivery and its transaction reference', () => {
    expect(DeliveryMapper.toDomain(delivery)).toEqual({
      id: delivery.id,
      country: delivery.country,
      city: delivery.city,
      locality: delivery.locality,
      subLocality: delivery.subLocality,
      address: delivery.address,
      postalCode: delivery.postalCode,
      additionalInfo: delivery.additionalInfo,
      transactionId: 'transaction-id',
      transaction: {
        uuid: 'transaction-id',
        paymentReference: 'PAY-1',
        total: 39.98,
      },
    });
  });

  it('maps a delivery without a transaction', () => {
    const entity = {
      ...delivery,
      transactionId: null,
      transaction: null,
    } as unknown as DeliveryEntity;

    expect(DeliveryMapper.toDomain(entity).transaction).toBeNull();
    expect(DeliveryMapper.toDomain(entity).transactionId).toBeNull();
  });

  it('maps delivery input to an entity', () => {
    const input = {
      country: delivery.country,
      city: delivery.city,
      locality: delivery.locality,
      subLocality: delivery.subLocality,
      address: delivery.address,
      postalCode: delivery.postalCode,
      additionalInfo: delivery.additionalInfo,
      transactionId: null,
    };

    expect(DeliveryMapper.toEntity(input)).toEqual(
      expect.objectContaining(input),
    );
  });
});

describe('OrderItemMapper', () => {
  it('maps an order item and its product', () => {
    expect(OrderItemMapper.toDomain(orderItem)).toEqual({
      id: 'item-id',
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
      product: {
        id: 'product-id',
        name: 'Product',
        image: 'https://example.com/product.png',
        price: 19.99,
        quantity: 4,
      },
    });
  });

  it('maps an order item without a loaded product', () => {
    const entity = {
      ...orderItem,
      product: null,
    } as unknown as OrderItemEntity;

    expect(OrderItemMapper.toDomain(entity).product).toBeNull();
  });

  it('maps order item input to an entity', () => {
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    expect(OrderItemMapper.toEntity(input)).toEqual(
      expect.objectContaining(input),
    );
  });
});

describe('TransactionMapper', () => {
  it('maps a complete transaction to the domain', () => {
    const result = TransactionMapper.toDomain(transaction);

    expect(result.uuid).toBe('transaction-id');
    expect(result.paymentReference).toBe('PAY-1');
    expect(result.total).toBe(39.98);
    expect(result.customerId).toBe('customer-id');
    expect(result.statusId).toBe(1);
    expect(result.customer).toEqual(customer);
    expect(result.status).toEqual(status);
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
      status: null,
      delivery: null,
      items: undefined,
    } as unknown as TransactionEntity;

    expect(TransactionMapper.toDomain(entity)).toEqual(
      expect.objectContaining({
        customer: null,
        status: null,
        delivery: null,
        items: [],
      }),
    );
  });

  it('maps transaction input to an entity', () => {
    const input = {
      paymentReference: 'PAY-1',
      total: 39.98,
      statusId: 1,
    };

    expect(TransactionMapper.toEntity(input)).toEqual(
      expect.objectContaining(input),
    );
  });
});
