import type {
  CreateOrderItemInput,
  OrderItem,
} from '../models/order-item.model';

export const ORDER_ITEM_PERSISTENCE_PORT = Symbol(
  'ORDER_ITEM_PERSISTENCE_PORT',
);

export interface IOrderItemPersistencePort {
  getAll(): Promise<OrderItem[]>;
  getById(id: string): Promise<OrderItem | null>;
  create(input: CreateOrderItemInput): Promise<OrderItem>;
  /** Devuelve los items ya guardados para poder armar el cuerpo de la transaccion. */
  saveAll(items: CreateOrderItemInput[]): Promise<OrderItem[]>;
}
