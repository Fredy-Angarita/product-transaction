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
import type { IWompiPaymentPort } from '../../spi/wompi.payment.port';
import type { ITransactionApi } from '../transaction.interface';

export class TransactionUseCase implements ITransactionApi {
  constructor(
    private readonly transactionPersistence: ITransactionPersistencePort,
    private readonly productPersistence: IProductPersistencePort,
    private readonly statusPersistence: ITransactionStatusPersistencePort,
    private readonly wompiPayment: IWompiPaymentPort,
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

    const quantitiesByProduct = this.getTotal(input.items);

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

    const total = Number(
      items
        .reduce(
          (accumulator, item) => accumulator + item.price * item.quantity,
          0,
        )
        .toFixed(2),
    );

    // El token no se persiste: queda disponible para enviarlo a Wompi
    // en una iteracion posterior.
    await this.wompiPayment.tokenizeCard(input.card);

    return this.transactionPersistence.create({
      paymentReference: input.paymentReference,
      total,
      statusId: input.statusId,
      customer: input.customer,
      delivery: input.delivery,
      items,
    });
  }

  private getTotal(
    items: Array<{ productId: string; quantity: number }>,
  ): Map<string, number> {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    }
    return map;
  }

  private priceInCents(total: number): number {
    return total * 100;
  }
}
