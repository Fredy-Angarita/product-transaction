import type {
  CreateTransactionInput,
  Transaction,
} from '../models/transaction.model';

export const TRANSACTION_API = Symbol('TRANSACTION_API');

export interface ITransactionApi {
  getTransactions(): Promise<Transaction[]>;
  createTransaction(input: CreateTransactionInput): Promise<Transaction>;
}
