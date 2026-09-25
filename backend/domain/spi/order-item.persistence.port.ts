import type {
  CreateOrderItemInput,
  OrderItem,
} from '../models/order-item.model';

export const ORDER_ITEM_PERSISTENCE_PORT = Symbol(
  'ORDER_ITEM_PERSISTENCE_PORT',
);

export interface IOrderItemPersistencePort {
  getAll(): Promise<OrderItem[]>;
  create(input: CreateOrderItemInput): Promise<OrderItem>;
  create(input: CreateOrderItemInput): Promise<OrderItem>;
}
