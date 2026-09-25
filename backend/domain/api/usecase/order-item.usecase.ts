import { ResourceNotFoundError } from '../../errors/resource-not-found.error';
import type {
  CreateOrderItemInput,
  OrderItem,
} from '../../models/order-item.model';
import type { IOrderItemPersistencePort } from '../../spi/order-item.persistence.port';
import type { IProductPersistencePort } from '../../spi/product.persistence.port';
import type { ITransactionPersistencePort } from '../../spi/transaction.persistence.port';
import type { IOrderItemApi } from '../order-item.interface';

export class OrderItemUseCase implements IOrderItemApi {
  constructor(
    private readonly orderItemPersistence: IOrderItemPersistencePort,
    private readonly productPersistence: IProductPersistencePort,
    private readonly transactionPersistence: ITransactionPersistencePort,
  ) {}

  getOrderItems(): Promise<OrderItem[]> {
    return this.orderItemPersistence.getAll();
  }

  async createOrderItem(input: CreateOrderItemInput): Promise<OrderItem> {
    const [product, transaction] = await Promise.all([
      this.productPersistence.getById(input.productId),
      this.transactionPersistence.getById(input.transactionId),
    ]);

    if (!product) {
      throw new ResourceNotFoundError('Product', input.productId);
    }

    if (!transaction) {
      throw new ResourceNotFoundError('Transaction', input.transactionId);
    }

    return this.orderItemPersistence.create(input);
  }
}
