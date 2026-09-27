import type { CardModel } from './card.model';
import type { CreateCustomerInput, Customer } from './customer.model';
import type { Delivery, DeliveryData } from './delivery.model';
import type { OrderItem, TransactionItemInput } from './order-item.model';
import type { TransactionStatus } from './transaction-status.model';

export interface Transaction {
  uuid: string;
  total: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
  customerId: string;
  statusId: number;
  customer: Customer | null;
  status: TransactionStatus | null;
  delivery: Delivery | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  acceptanceToken: string;
  acceptPersonalAuth: string;
  customer: CreateCustomerInput;
  delivery: DeliveryData;
  items: TransactionItemInput[];
  card: CardModel;
}

export interface CreateTransactionPersistenceInput {
  acceptanceToken: string;
  acceptPersonalAuth: string;
  total: number;
  statusId: number;
  customerId: string;
}
