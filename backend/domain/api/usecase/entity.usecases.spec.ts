/* eslint-disable @typescript-eslint/unbound-method */
import { ResourceNotFoundError } from '../../errors/resource-not-found.error';
import type { Delivery } from '../../models/delivery.model';
import type { OrderItem } from '../../models/order-item.model';
import type { Product } from '../../models/product.model';
import type {
  CreateTransactionInput,
  Transaction,
} from '../../models/transaction.model';
import type { ICustomerPersistencePort } from '../../spi/customer.persistence.port';
import type { IDeliveryPersistencePort } from '../../spi/delivery.persistence.port';
import type { IOrderItemPersistencePort } from '../../spi/order-item.persistence.port';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { ITransactionPersistencePort } from '../../spi/transaction.persistence.port';
import type { ITransactionStatusPersistencePort } from '../../spi/transaction-status.persistence.port';
import type { IWompiPaymentPort } from '../../spi/wompi.payment.port';
import type { CardModel } from '../../models/card.model';
import { CustomerUseCase } from './customer.usecase';
import { DeliveryUseCase } from './delivery.usecase';
import { OrderItemUseCase } from './order-item.usecase';
import { TransactionUseCase } from './transaction.usecase';
import { TransactionStatusUseCase } from './transaction-status.usecase';

const customer = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
};

const customerInput = {
  name: customer.name,
  lastName: customer.lastName,
  identificationNumber: customer.identificationNumber,
  email: customer.email,
};

const status = { id: 1, status: 'PENDING' };
const product: Product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 19.99,
  quantity: 10,
};
const transaction = { uuid: 'transaction-id' } as Transaction;
const delivery = { id: 'delivery-id' } as Delivery;
const orderItem = { id: 'item-id' } as OrderItem;

const card: CardModel = {
  number: '4242424242424242',
  cvc: '123',
  exp_month: '08',
  exp_year: '28',
  card_holder: 'Test User',
};

const createWompiPayment = (): jest.Mocked<IWompiPaymentPort> => ({
  getAcceptableTerms: jest.fn(),
  tokenizeCard: jest.fn().mockResolvedValue('tok_123'),
});

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

const createTransactionInput = (
  items: CreateTransactionInput['items'] = [
    { productId: 'product-id', quantity: 2 },
  ],
): CreateTransactionInput => ({
  paymentReference: 'PAY-1',
  statusId: 1,
  customer: customerInput,
  delivery: deliveryInput,
  items,
  card,
});

const createCustomerPersistence =
  (): jest.Mocked<ICustomerPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([customer]),
    create: jest.fn().mockResolvedValue(customer),
  });

const createStatusPersistence =
  (): jest.Mocked<ITransactionStatusPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([status]),
    getById: jest.fn().mockResolvedValue(status),
    create: jest.fn().mockResolvedValue(status),
  });

const createProductPersistence = (): jest.Mocked<IProductPersistencePort> => ({
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue(product),
  getByIds: jest.fn().mockResolvedValue([product]),
  create: jest.fn().mockResolvedValue(product),
  saveAll: jest.fn().mockResolvedValue(undefined),
});

const createTransactionPersistence =
  (): jest.Mocked<ITransactionPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([transaction]),
    getById: jest.fn().mockResolvedValue(transaction),
    create: jest.fn().mockResolvedValue(transaction),
  });

const createDeliveryPersistence =
  (): jest.Mocked<IDeliveryPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([delivery]),
    create: jest.fn().mockResolvedValue(delivery),
  });

const createOrderItemPersistence =
  (): jest.Mocked<IOrderItemPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([orderItem]),
    create: jest.fn().mockResolvedValue(orderItem),
  });

describe('CustomerUseCase', () => {
  it('lists and creates customers', async () => {
    const persistence = createCustomerPersistence();
    const useCase = new CustomerUseCase(persistence);

    await expect(useCase.getCustomers()).resolves.toEqual([customer]);
    await expect(useCase.createCustomer(customerInput)).resolves.toEqual(
      customer,
    );
    expect(persistence.create).toHaveBeenCalledWith(customerInput);
  });
});

describe('TransactionStatusUseCase', () => {
  it('lists and creates statuses', async () => {
    const persistence = createStatusPersistence();
    const useCase = new TransactionStatusUseCase(persistence);

    await expect(useCase.getTransactionStatuses()).resolves.toEqual([status]);
    await expect(
      useCase.createTransactionStatus({ status: 'PENDING' }),
    ).resolves.toEqual(status);
    expect(persistence.create).toHaveBeenCalledWith({ status: 'PENDING' });
  });
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

describe('OrderItemUseCase', () => {
  it('lists and creates order items after validating relations', async () => {
    const orderItemPersistence = createOrderItemPersistence();
    const productPersistence = createProductPersistence();
    const transactionPersistence = createTransactionPersistence();
    const useCase = new OrderItemUseCase(
      orderItemPersistence,
      productPersistence,
      transactionPersistence,
    );
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    await expect(useCase.getOrderItems()).resolves.toEqual([orderItem]);
    await expect(useCase.createOrderItem(input)).resolves.toEqual(orderItem);
    expect(productPersistence.getById).toHaveBeenCalledWith('product-id');
    expect(transactionPersistence.getById).toHaveBeenCalledWith(
      'transaction-id',
    );
    expect(orderItemPersistence.create).toHaveBeenCalledWith(input);
  });

  it('rejects an order item when its product does not exist', async () => {
    const orderItemPersistence = createOrderItemPersistence();
    const productPersistence = createProductPersistence();
    const transactionPersistence = createTransactionPersistence();
    productPersistence.getById.mockResolvedValue(null);
    const useCase = new OrderItemUseCase(
      orderItemPersistence,
      productPersistence,
      transactionPersistence,
    );

    await expect(
      useCase.createOrderItem({
        transactionId: 'transaction-id',
        productId: 'missing',
        price: 19.99,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(orderItemPersistence.create).not.toHaveBeenCalled();
  });

  it('rejects an order item when its transaction does not exist', async () => {
    const orderItemPersistence = createOrderItemPersistence();
    const productPersistence = createProductPersistence();
    const transactionPersistence = createTransactionPersistence();
    transactionPersistence.getById.mockResolvedValue(null);
    const useCase = new OrderItemUseCase(
      orderItemPersistence,
      productPersistence,
      transactionPersistence,
    );

    await expect(
      useCase.createOrderItem({
        transactionId: 'missing',
        productId: 'product-id',
        price: 19.99,
        quantity: 2,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(orderItemPersistence.create).not.toHaveBeenCalled();
  });
});

describe('TransactionUseCase', () => {
  it('lists transactions', async () => {
    const useCase = new TransactionUseCase(
      createTransactionPersistence(),
      createProductPersistence(),
      createStatusPersistence(),
      createWompiPayment(),
    );

    await expect(useCase.getTransactions()).resolves.toEqual([transaction]);
  });

  it('calculates prices and total, merging repeated products', async () => {
    const transactionPersistence = createTransactionPersistence();
    const productPersistence = createProductPersistence();
    const statusPersistence = createStatusPersistence();
    const wompiPayment = createWompiPayment();
    const useCase = new TransactionUseCase(
      transactionPersistence,
      productPersistence,
      statusPersistence,
      wompiPayment,
    );
    const input = createTransactionInput([
      { productId: 'product-id', quantity: 2 },
      { productId: 'product-id', quantity: 3 },
    ]);

    await expect(useCase.createTransaction(input)).resolves.toEqual(
      transaction,
    );
    expect(statusPersistence.getById).toHaveBeenCalledWith(1);
    expect(productPersistence.getByIds).toHaveBeenCalledWith(['product-id']);
    expect(wompiPayment.tokenizeCard).toHaveBeenCalledWith(card);
    expect(transactionPersistence.create).toHaveBeenCalledWith({
      paymentReference: 'PAY-1',
      total: 99.95,
      statusId: 1,
      customer: customerInput,
      delivery: deliveryInput,
      items: [{ productId: 'product-id', price: 19.99, quantity: 5 }],
    });
  });

  it('does not persist the transaction when card tokenization fails', async () => {
    const transactionPersistence = createTransactionPersistence();
    const wompiPayment = createWompiPayment();
    wompiPayment.tokenizeCard.mockRejectedValue(
      new Error('tokenization failed'),
    );
    const useCase = new TransactionUseCase(
      transactionPersistence,
      createProductPersistence(),
      createStatusPersistence(),
      wompiPayment,
    );

    await expect(
      useCase.createTransaction(createTransactionInput()),
    ).rejects.toThrow('tokenization failed');
    expect(transactionPersistence.create).not.toHaveBeenCalled();
  });

  it('rejects a transaction without items', async () => {
    const useCase = new TransactionUseCase(
      createTransactionPersistence(),
      createProductPersistence(),
      createStatusPersistence(),
      createWompiPayment(),
    );

    await expect(
      useCase.createTransaction(createTransactionInput([])),
    ).rejects.toThrow('A transaction must contain at least one item');
  });

  it('rejects a transaction when its status does not exist', async () => {
    const transactionPersistence = createTransactionPersistence();
    const statusPersistence = createStatusPersistence();
    statusPersistence.getById.mockResolvedValue(null);
    const useCase = new TransactionUseCase(
      transactionPersistence,
      createProductPersistence(),
      statusPersistence,
      createWompiPayment(),
    );

    await expect(
      useCase.createTransaction(createTransactionInput()),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(transactionPersistence.create).not.toHaveBeenCalled();
  });

  it('rejects a transaction when a product does not exist', async () => {
    const transactionPersistence = createTransactionPersistence();
    const productPersistence = createProductPersistence();
    productPersistence.getByIds.mockResolvedValue([]);
    const useCase = new TransactionUseCase(
      transactionPersistence,
      productPersistence,
      createStatusPersistence(),
      createWompiPayment(),
    );

    await expect(
      useCase.createTransaction(createTransactionInput()),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
    expect(transactionPersistence.create).not.toHaveBeenCalled();
  });

  it('rejects a transaction when stock is insufficient', async () => {
    const transactionPersistence = createTransactionPersistence();
    const productPersistence = createProductPersistence();
    const useCase = new TransactionUseCase(
      transactionPersistence,
      productPersistence,
      createStatusPersistence(),
      createWompiPayment(),
    );

    await expect(
      useCase.createTransaction(
        createTransactionInput([{ productId: 'product-id', quantity: 11 }]),
      ),
    ).rejects.toThrow('does not have enough stock');
    expect(transactionPersistence.create).not.toHaveBeenCalled();
  });
});
