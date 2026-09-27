import type {
  CreateOrderItemInput,
  OrderItem,
} from '../../../../../domain/models/order-item.model';
import { OrderItemEntity } from '../entity/order.item.entity';
import { ProductMapper } from './product.mapper';

export class OrderItemMapper {
  static toDomain(entity: OrderItemEntity): OrderItem {
    return {
      id: entity.id,
      transactionId: entity.transactionId,
      productId: entity.productId,
      price: Number(entity.price),
      quantity: entity.quantity,
      product: entity.product ? ProductMapper.toDomain(entity.product) : null,
    };
  }

  static toEntity(input: CreateOrderItemInput): OrderItemEntity {
    const entity = new OrderItemEntity();
    entity.transactionId = input.transactionId;
    entity.productId = input.productId;
    entity.price = input.price;
    entity.quantity = input.quantity;
    return entity;
  }
}
