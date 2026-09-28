import type { Product } from './product.model';

export interface OrderItem {
  id: string;
  transactionId: string;
  productId: string;
  price: number;
  quantity: number;
  product: Product | null;
}

export interface CreateOrderItemInput {
  transactionId: string;
  productId: string;
  price: number;
  quantity: number;
}

export interface TransactionItemInput {
  productId: string;
  quantity: number;
}
