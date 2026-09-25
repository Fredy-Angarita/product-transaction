import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../models/transaction-status.model';

export const TRANSACTION_STATUS_API = Symbol('TRANSACTION_STATUS_API');

export interface ITransactionStatusApi {
  getTransactionStatuses(): Promise<TransactionStatus[]>;
  createTransactionStatus(
    input: CreateTransactionStatusInput,
  ): Promise<TransactionStatus>;
}
