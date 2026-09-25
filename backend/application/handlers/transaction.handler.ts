import { Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_API } from '../../domain/api/transaction.interface';
import type { ITransactionApi } from '../../domain/api/transaction.interface';
import type {
  CreateTransactionInput,
  Transaction,
} from '../../domain/models/transaction.model';

@Injectable()
export class TransactionHandler {
  constructor(
    @Inject(TRANSACTION_API)
    private readonly transactionApi: ITransactionApi,
  ) {}

  getTransactions(): Promise<Transaction[]> {
    return this.transactionApi.getTransactions();
  }

  createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    return this.transactionApi.createTransaction(input);
  }
}
