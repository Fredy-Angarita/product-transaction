import { Inject, Injectable } from '@nestjs/common';

import { ORDER_ITEM_API } from '../../domain/api/order-item.interface';
import type { IOrderItemApi } from '../../domain/api/order-item.interface';
import type {
  CreateOrderItemInput,
  OrderItem,
} from '../../domain/models/order-item.model';

@Injectable()
export class OrderItemHandler {
  constructor(
    @Inject(ORDER_ITEM_API)
    private readonly orderItemApi: IOrderItemApi,
  ) {}

  getOrderItems(): Promise<OrderItem[]> {
    return this.orderItemApi.getOrderItems();
  }

  createOrderItem(input: CreateOrderItemInput): Promise<OrderItem> {
    return this.orderItemApi.createOrderItem(input);
  }
}
