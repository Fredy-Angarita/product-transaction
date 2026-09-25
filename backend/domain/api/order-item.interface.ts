import type {
  CreateOrderItemInput,
  OrderItem,
} from '../models/order-item.model';

export const ORDER_ITEM_API = Symbol('ORDER_ITEM_API');

export interface IOrderItemApi {
  getOrderItems(): Promise<OrderItem[]>;
  createOrderItem(input: CreateOrderItemInput): Promise<OrderItem>;
}
