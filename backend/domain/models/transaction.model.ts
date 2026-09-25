import type { CreateCustomerInput, Customer } from './customer.model';
import type { Delivery, DeliveryData } from './delivery.model';
import type { OrderItem, TransactionItemInput } from './order-item.model';
import type { TransactionStatus } from './transaction-status.model';

export interface Transaction {
  uuid: string;
  paymentReference: string;
  total: number;
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
  paymentReference: string;
  statusId: number;
  customer: CreateCustomerInput;
  delivery: DeliveryData;
  items: TransactionItemInput[];
}

export interface CreateTransactionPersistenceInput {
  paymentReference: string;
  total: number;
  statusId: number;
  customer: CreateCustomerInput;
  delivery: DeliveryData;
  items: {
    productId: string;
    price: number;
    quantity: number;
  }[];
}
