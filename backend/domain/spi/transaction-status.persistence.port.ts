import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../models/transaction-status.model';

export const TRANSACTION_STATUS_PERSISTENCE_PORT = Symbol(
  'TRANSACTION_STATUS_PERSISTENCE_PORT',
);

export interface ITransactionStatusPersistencePort {
  getAll(): Promise<TransactionStatus[]>;
  getById(id: number): Promise<TransactionStatus | null>;
  create(input: CreateTransactionStatusInput): Promise<TransactionStatus>;
}
