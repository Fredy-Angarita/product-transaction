import type { CardModel } from './card.model';
import type { CreateCustomerInput, Customer } from './customer.model';
import type { Delivery, DeliveryData } from './delivery.model';
import type { OrderItem, TransactionItemInput } from './order-item.model';
import { TransactionStatusEnum } from './transaction-status.enum';

export interface Transaction {
  uuid: string;
  total: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
  customerId: string;
  status: TransactionStatusEnum;
  customer: Customer | null;
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
  status: TransactionStatusEnum;
  customerId: string;
}
