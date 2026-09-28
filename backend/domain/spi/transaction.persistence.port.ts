import type {
  CreateTransactionPersistenceInput,
  Transaction,
} from '../models/transaction.model';
import { TransactionStatusEnum } from '../models/transaction-status.enum';

export const TRANSACTION_PERSISTENCE_PORT = Symbol(
  'TRANSACTION_PERSISTENCE_PORT',
);

export interface ITransactionPersistencePort {
  getAll(): Promise<Transaction[]>;
  getById(uuid: string): Promise<Transaction | null>;
  create(input: CreateTransactionPersistenceInput): Promise<Transaction>;
  updateStatus(uuid: string, status: TransactionStatusEnum): Promise<void>;
}
