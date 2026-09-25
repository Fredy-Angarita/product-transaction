import type { Customer } from '../../../../domain/models/customer.model';
import type { Delivery } from '../../../../domain/models/delivery.model';
import type { OrderItem } from '../../../../domain/models/order-item.model';
import type { Product } from '../../../../domain/models/product.model';
import type { Transaction } from '../../../../domain/models/transaction.model';
import type { TransactionStatus } from '../../../../domain/models/transaction-status.model';
import { CustomerController } from './customer.controller';
import { DeliveryController } from './delivery.controller';
import { OrderItemController } from './order-item.controller';
import { TransactionController } from './transaction.controller';
import { TransactionStatusController } from './transaction-status.controller';

const customer: Customer = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
};

const status: TransactionStatus = { id: 1, status: 'PENDING' };

const product: Product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 19.99,
  quantity: 4,
};

const orderItem: OrderItem = {
  id: 'item-id',
  transactionId: 'transaction-id',
  productId: 'product-id',
  price: 19.99,
  quantity: 2,
  product,
};

const delivery: Delivery = {
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
    total: 39.98,
  },
};

const transaction: Transaction = {
  uuid: 'transaction-id',
  paymentReference: 'PAY-1',
  total: 39.98,
  customerId: customer.id,
  statusId: status.id,
  customer,
  status,
  delivery,
  items: [orderItem],
  createdAt: '2026-09-25T10:00:00.000Z',
  updatedAt: '2026-09-25T11:00:00.000Z',
};

describe('entity controllers', () => {
  it('returns customers and creates a customer', async () => {
    const getCustomers = jest.fn().mockResolvedValue([customer]);
    const createCustomer = jest.fn().mockResolvedValue(customer);
    const controller = new CustomerController({
      getCustomers,
      createCustomer,
    } as never);

    await expect(controller.getCustomers()).resolves.toEqual([customer]);
    const input = {
      name: 'Ana',
      lastName: 'Gómez',
      identificationNumber: '123456789',
      email: 'ana@example.com',
    };
    await expect(controller.createCustomer(input)).resolves.toEqual(customer);
    expect(createCustomer).toHaveBeenCalledWith(input);
  });

  it('returns statuses and creates a status', async () => {
    const getTransactionStatuses = jest.fn().mockResolvedValue([status]);
    const createTransactionStatus = jest.fn().mockResolvedValue(status);
    const controller = new TransactionStatusController({
      getTransactionStatuses,
      createTransactionStatus,
    } as never);

    await expect(controller.getTransactionStatuses()).resolves.toEqual([
      status,
    ]);
    await expect(
      controller.createTransactionStatus({ status: 'PENDING' }),
    ).resolves.toEqual(status);
  });

  it('returns deliveries and creates a delivery without a transaction', async () => {
    const deliveryWithoutTransaction = {
      ...delivery,
      transactionId: null,
      transaction: null,
    };
    const getDeliveries = jest
      .fn()
      .mockResolvedValue([deliveryWithoutTransaction]);
    const createDelivery = jest
      .fn()
      .mockResolvedValue(deliveryWithoutTransaction);
    const controller = new DeliveryController({
      getDeliveries,
      createDelivery,
    } as never);

    await expect(controller.getDeliveries()).resolves.toEqual([
      expect.objectContaining({ transaction: null, transactionId: null }),
    ]);
    await expect(
      controller.createDelivery({
        country: 'Colombia',
        city: 'Bogotá',
        locality: 'Chapinero',
        subLocality: 'Chapinero Alto',
        address: 'Calle 100 # 10-20',
        postalCode: '110111',
        additionalInfo: 'Apartamento 401',
      }),
    ).resolves.toEqual(deliveryWithoutTransaction);
    expect(createDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ transactionId: null }),
    );
  });

  it('returns order items with products', async () => {
    const getOrderItems = jest.fn().mockResolvedValue([orderItem]);
    const controller = new OrderItemController({ getOrderItems } as never);

    const [response] = await controller.getOrderItems();

    expect(response.product?.id).toBe(product.id);
  });

  it('returns and creates order items', async () => {
    const createOrderItem = jest.fn().mockResolvedValue(orderItem);
    const controller = new OrderItemController({ createOrderItem } as never);
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    const response = await controller.createOrderItem(input);

    expect(response.product?.id).toBe(product.id);
  });

  it('maps an order item without a product', async () => {
    const controller = new OrderItemController({
      getOrderItems: jest
        .fn()
        .mockResolvedValue([{ ...orderItem, product: null }]),
    } as never);

    await expect(controller.getOrderItems()).resolves.toEqual([
      expect.objectContaining({ product: null }),
    ]);
  });

  it('returns and creates transactions with their relations', async () => {
    const getTransactions = jest.fn().mockResolvedValue([transaction]);
    const createTransaction = jest.fn().mockResolvedValue(transaction);
    const controller = new TransactionController({
      getTransactions,
      createTransaction,
    } as never);
    const input = {
      paymentReference: 'PAY-1',
      statusId: 1,
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
      },
      items: [{ productId: 'product-id', quantity: 2 }],
    };

    await expect(controller.getTransactions()).resolves.toEqual([
      expect.objectContaining({
        customer,
        status,
        delivery,
        items: [expect.any(Object)],
      }),
    ]);
    await expect(controller.createTransaction(input)).resolves.toEqual(
      expect.objectContaining({ uuid: 'transaction-id' }),
    );
  });

  it('maps a transaction without optional relations', async () => {
    const incomplete = {
      ...transaction,
      customer: null,
      status: null,
      delivery: null,
      items: [],
    };
    const controller = new TransactionController({
      getTransactions: jest.fn().mockResolvedValue([incomplete]),
    } as never);

    await expect(controller.getTransactions()).resolves.toEqual([
      expect.objectContaining({
        customer: null,
        status: null,
        delivery: null,
        items: [],
      }),
    ]);
  });
});
