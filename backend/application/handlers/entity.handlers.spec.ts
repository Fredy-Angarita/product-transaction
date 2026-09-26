import type { ICustomerApi } from '../../domain/api/customer.interface';
import type { IDeliveryApi } from '../../domain/api/delivery.interface';
import type { IOrderItemApi } from '../../domain/api/order-item.interface';
import type { ITransactionApi } from '../../domain/api/transaction.interface';
import type { ITransactionStatusApi } from '../../domain/api/transaction-status.interface';
import type { Customer } from '../../domain/models/customer.model';
import type { Delivery } from '../../domain/models/delivery.model';
import type { OrderItem } from '../../domain/models/order-item.model';
import type { Transaction } from '../../domain/models/transaction.model';
import { CustomerHandler } from './customer.handler';
import { DeliveryHandler } from './delivery.handler';
import { OrderItemHandler } from './order-item.handler';
import { TransactionHandler } from './transaction.handler';
import { TransactionStatusHandler } from './transaction-status.handler';

const customer = { id: 'customer-id' } as Customer;
const delivery = { id: 'delivery-id' } as Delivery;
const orderItem = { id: 'item-id' } as OrderItem;
const transaction = { uuid: 'transaction-id' } as Transaction;
const status = { id: 1, status: 'PENDING' };

describe('entity handlers', () => {
  it('delegates customer operations', async () => {
    const getCustomers = jest.fn().mockResolvedValue([customer]);
    const createCustomer = jest.fn().mockResolvedValue(customer);
    const api: jest.Mocked<ICustomerApi> = { getCustomers, createCustomer };
    const handler = new CustomerHandler(api);

    await expect(handler.getCustomers()).resolves.toEqual([customer]);
    await expect(
      handler.createCustomer({
        name: 'Ana',
        lastName: 'Gómez',
        identificationNumber: '123456789',
        email: 'ana@example.com',
      }),
    ).resolves.toEqual(customer);
    expect(createCustomer).toHaveBeenCalledTimes(1);
  });

  it('delegates delivery operations', async () => {
    const getDeliveries = jest.fn().mockResolvedValue([delivery]);
    const createDelivery = jest.fn().mockResolvedValue(delivery);
    const api: jest.Mocked<IDeliveryApi> = { getDeliveries, createDelivery };
    const handler = new DeliveryHandler(api);

    await expect(handler.getDeliveries()).resolves.toEqual([delivery]);
    await expect(
      handler.createDelivery({
        country: 'Colombia',
        city: 'Bogotá',
        locality: 'Chapinero',
        subLocality: 'Chapinero Alto',
        address: 'Calle 100 # 10-20',
        postalCode: '110111',
        additionalInfo: 'Apartamento 401',
        transactionId: null,
      }),
    ).resolves.toEqual(delivery);
  });

  it('delegates order item operations', async () => {
    const getOrderItems = jest.fn().mockResolvedValue([orderItem]);
    const createOrderItem = jest.fn().mockResolvedValue(orderItem);
    const api: jest.Mocked<IOrderItemApi> = { getOrderItems, createOrderItem };
    const handler = new OrderItemHandler(api);

    await expect(handler.getOrderItems()).resolves.toEqual([orderItem]);
    await expect(
      handler.createOrderItem({
        transactionId: 'transaction-id',
        productId: 'product-id',
        price: 19.99,
        quantity: 2,
      }),
    ).resolves.toEqual(orderItem);
  });

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
        card: {
          number: '4242424242424242',
          cvc: '123',
          exp_month: '08',
          exp_year: '28',
          card_holder: 'Test User',
        },
      }),
    ).resolves.toEqual(transaction);
  });

  it('delegates status operations', async () => {
    const getTransactionStatuses = jest.fn().mockResolvedValue([status]);
    const createTransactionStatus = jest.fn().mockResolvedValue(status);
    const api: jest.Mocked<ITransactionStatusApi> = {
      getTransactionStatuses,
      createTransactionStatus,
    };
    const handler = new TransactionStatusHandler(api);

    await expect(handler.getTransactionStatuses()).resolves.toEqual([status]);
    await expect(
      handler.createTransactionStatus({ status: 'PENDING' }),
    ).resolves.toEqual(status);
  });
});
