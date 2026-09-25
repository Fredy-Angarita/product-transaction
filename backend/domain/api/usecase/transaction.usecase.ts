import { EmptyTransactionItemsError } from '../../errors/empty-transaction-items.error';
import { InsufficientStockError } from '../../errors/insufficient-stock.error';
import { ResourceNotFoundError } from '../../errors/resource-not-found.error';
import type {
  CreateTransactionInput,
  Transaction,
} from '../../models/transaction.model';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { ITransactionPersistencePort } from '../../spi/transaction.persistence.port';
import type { ITransactionStatusPersistencePort } from '../../spi/transaction-status.persistence.port';
import type { ITransactionApi } from '../transaction.interface';

export class TransactionUseCase implements ITransactionApi {
  constructor(
    private readonly transactionPersistence: ITransactionPersistencePort,
    private readonly productPersistence: IProductPersistencePort,
    private readonly statusPersistence: ITransactionStatusPersistencePort,
  ) {}

  getTransactions(): Promise<Transaction[]> {
    return this.transactionPersistence.getAll();
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    if (input.items.length === 0) {
      throw new EmptyTransactionItemsError();
    }

    const status = await this.statusPersistence.getById(input.statusId);

    if (!status) {
      throw new ResourceNotFoundError('Transaction status', input.statusId);
    }

    const quantitiesByProduct = new Map<string, number>();

    for (const item of input.items) {
      quantitiesByProduct.set(
        item.productId,
        (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const items = await Promise.all(
      Array.from(quantitiesByProduct.entries()).map(
        async ([productId, quantity]) => {
          const product = await this.productPersistence.getById(productId);

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
      ),
    );

    const total = Number(
      items
        .reduce(
          (accumulator, item) => accumulator + item.price * item.quantity,
          0,
        )
        .toFixed(2),
    );

    return this.transactionPersistence.create({
      paymentReference: input.paymentReference,
      total,
      statusId: input.statusId,
      customer: input.customer,
      delivery: input.delivery,
      items,
    });
  }
}
