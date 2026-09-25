export interface TransactionStatus {
  id: number;
  status: string;
}

export type CreateTransactionStatusInput = Omit<TransactionStatus, 'id'>;
