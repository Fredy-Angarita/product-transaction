import { EmptyTransactionItemsError } from '../../errors/empty-transaction-items.error';
import { InsufficientStockError } from '../../errors/insufficient-stock.error';
import { ResourceNotFoundError } from '../../errors/resource-not-found.error';
import { TransactionStatusEnum } from '../../models/transaction-status.enum';

import type {
  CreateTransactionInput,
  Transaction,
} from '../../models/transaction.model';
import type { ICustomerPersistencePort } from '../../spi/customer.persistence.port';
import type { IDeliveryPersistencePort } from '../../spi/delivery.persistence.port';
import type { IOrderItemPersistencePort } from '../../spi/order-item.persistence.port';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { ITransactionPersistencePort } from '../../spi/transaction.persistence.port';
import type { IWompiApi } from '../wompi.interface';
import type { ITransactionApi } from '../transaction.interface';
import { ICalculateFeeApi } from '../calculate-fee.interface';

export class TransactionUseCase implements ITransactionApi {
  constructor(
    private readonly transactionPersistence: ITransactionPersistencePort,
    private readonly productPersistence: IProductPersistencePort,
    private readonly wompiUseCase: IWompiApi,
    private readonly deliveryPersistence: IDeliveryPersistencePort,
    private readonly orderItemPersistence: IOrderItemPersistencePort,
    private readonly customerPersistence: ICustomerPersistencePort,
    private readonly deliveryUseCase: ICalculateFeeApi,
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
    const total = this.subTotal(items);

    const customer = await this.customerPersistence.create(input.customer);
    console.log('SE CREO EL CUSTOMER', JSON.stringify(customer));

    const transaction = await this.transactionPersistence.create({
      total,
      acceptanceToken: input.acceptanceToken,
      acceptPersonalAuth: input.acceptPersonalAuth,
      status: TransactionStatusEnum.PENDING,
      customerId: customer.id,
    });
    console.log('SE CREO LA TRANSACCIÓN', JSON.stringify(transaction));

    const deliveryFee = this.deliveryUseCase.calculateFee();
    const delivery = await this.deliveryPersistence.create({
      ...input.delivery,
      fee: deliveryFee,
      transactionId: transaction.uuid,
    });
    console.log('SE CREO EL DELIVERY', JSON.stringify(delivery));

    await this.orderItemPersistence.saveAll(
      items.map((item) => ({
        transactionId: transaction.uuid,
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
    );

    const wompiTransaction = await this.wompiUseCase.createWompiTransaction(
      {
        reference: transaction.uuid,
        amount_in_cents: this.valueInCents(total),
        currency: 'COP',
        customer_email: customer.email,
        payment_method_type: 'CARD',
        acceptance_token: input.acceptanceToken,
      },
      input.card,
    );
    console.log(
      'SE CREO LA TRANSACCIÓN EN WOMPI',
      JSON.stringify(wompiTransaction),
    );

    const result = await this.wompiUseCase.polling(wompiTransaction.data.id);

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
    } else if (result.data.status !== 'PENDING') {
      await this.transactionPersistence.updateStatus(
        transaction.uuid,
        TransactionStatusEnum[result.data.status],
      );
    }

    return transaction;
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
