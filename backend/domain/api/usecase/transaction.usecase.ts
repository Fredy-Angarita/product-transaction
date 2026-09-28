import { EmptyTransactionItemsError } from '../../errors/empty-transaction-items.error';
import { InsufficientStockError } from '../../errors/insufficient-stock.error';
import { PaymentProviderError } from '../../errors/payment-provider.error';
import { ResourceNotFoundError } from '../../errors/resource-not-found.error';
import {
  TransactionStatusEnum,
  WOMPI_STATUS_MAP,
} from '../../models/transaction-status.enum';

import type {
  CreateTransactionInput,
  Transaction,
} from '../../models/transaction.model';
import type { Customer } from '../../models/customer.model';
import type { TransactionResponse } from '../../models/wompi.model';
import type { ICustomerPersistencePort } from '../../spi/customer.persistence.port';
import type { IDeliveryPersistencePort } from '../../spi/delivery.persistence.port';
import type { IOrderItemPersistencePort } from '../../spi/order-item.persistence.port';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { ITransactionPersistencePort } from '../../spi/transaction.persistence.port';
import type { IWompiApi } from '../wompi.interface';
import type { ITransactionApi } from '../transaction.interface';

export class TransactionUseCase implements ITransactionApi {
  constructor(
    private readonly transactionPersistence: ITransactionPersistencePort,
    private readonly productPersistence: IProductPersistencePort,
    private readonly wompiUseCase: IWompiApi,
    private readonly deliveryPersistence: IDeliveryPersistencePort,
    private readonly orderItemPersistence: IOrderItemPersistencePort,
    private readonly customerPersistence: ICustomerPersistencePort,
  ) {}

  getTransactions(): Promise<Transaction[]> {
    return this.transactionPersistence.getAll();
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    if (input.items.length === 0) {
      throw new EmptyTransactionItemsError();
    }

    const quantitiesByProduct = this.getTotalByProduct(input.items);
    const items = await this.mapItems(quantitiesByProduct);
    const deliveryFee = input.delivery.fee;
    const total = this.subTotal(items) + deliveryFee;

    const customer = await this.customerPersistence.create(input.customer);

    const transaction = await this.transactionPersistence.create({
      total,
      acceptanceToken: input.acceptanceToken,
      acceptPersonalAuth: input.acceptPersonalAuth,
      status: TransactionStatusEnum.PENDING,
      customerId: customer.id,
    });

    await this.deliveryPersistence.create({
      ...input.delivery,
      fee: deliveryFee,
      transactionId: transaction.uuid,
    });

    await this.orderItemPersistence.saveAll(
      items.map((item) => ({
        transactionId: transaction.uuid,
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
    );

    const result = await this.settlePayment(
      transaction,
      customer,
      total,
      input,
    );

    if (!result) {
      await this.transactionPersistence.updateStatus(
        transaction.uuid,
        TransactionStatusEnum.DECLINED,
      );
      return transaction;
    }

    if (result.data.status === 'APPROVED') {
      for (const item of items) {
        const product = await this.productPersistence.getById(item.productId);
        if (product) {
          await this.productPersistence.updateStock(
            item.productId,
            product.quantity - item.quantity,
          );
        }
      }
      await this.transactionPersistence.updateStatus(
        transaction.uuid,
        TransactionStatusEnum.APPROVED,
      );
      return { ...transaction, status: TransactionStatusEnum.APPROVED };
    } else if (result.data.status !== 'PENDING') {
      const status = WOMPI_STATUS_MAP[result.data.status];
      await this.transactionPersistence.updateStatus(transaction.uuid, status);
      return { ...transaction, status: status };
    }

    return transaction;
  }

  private async settlePayment(
    transaction: Transaction,
    customer: Customer,
    total: number,
    input: CreateTransactionInput,
  ): Promise<TransactionResponse | null> {
    try {
      const payload = {
        reference: transaction.uuid,
        amount_in_cents: this.valueInCents(total),
        currency: 'COP',
        customer_email: customer.email,
        payment_method_type: 'CARD',
        acceptance_token: input.acceptanceToken,
      };
      const wompiTransaction = await this.wompiUseCase.createWompiTransaction(
        payload,
        input.card,
      );

      return await this.wompiUseCase.polling(wompiTransaction.data.id);
    } catch (error: unknown) {
      const status =
        error instanceof PaymentProviderError
          ? error.transactionStatus
          : TransactionStatusEnum.ERROR;

      await this.transactionPersistence.updateStatus(transaction.uuid, status);
      throw error;
    }
  }

  private async mapItems(quantitiesByProduct: Map<string, number>) {
    const productIds = Array.from(quantitiesByProduct.keys());
    const products = await this.productPersistence.getByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));
    const items = Array.from(quantitiesByProduct.entries()).map(
      ([productId, quantity]) => {
        const product = productMap.get(productId);

        if (!product) {
          throw new ResourceNotFoundError('Product', productId);
        }

        if (quantity > product.quantity) {
          throw new InsufficientStockError(
            productId,
            quantity,
            product.quantity,
          );
        }

        return {
          productId,
          price: product.price,
          quantity,
        };
      },
    );
    return items;
  }

  private subTotal(
    items: {
      productId: string;
      price: number;
      quantity: number;
    }[],
  ): number {
    return Number(
      items
        .reduce(
          (accumulator, item) => accumulator + item.price * item.quantity,
          0,
        )
        .toFixed(2),
    );
  }

  private getTotalByProduct(
    items: Array<{ productId: string; quantity: number }>,
  ): Map<string, number> {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    }
    return map;
  }

  private valueInCents(value: number) {
    return value * 100;
  }
}
