import type { TransactionReference } from './transaction-reference.model';

export interface Delivery {
  id: string;
  country: string;
  city: string;
  locality: string;
  subLocality: string;
  address: string;
  postalCode: string;
  additionalInfo: string;
  transactionId: string | null;
  transaction: TransactionReference | null;
}

export type DeliveryData = Omit<
  Delivery,
  'id' | 'transaction' | 'transactionId'
>;

export type CreateDeliveryInput = DeliveryData & {
  transactionId: string | null;
};
