import { Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_STATUS_API } from '../../domain/api/transaction-status.interface';
import type { ITransactionStatusApi } from '../../domain/api/transaction-status.interface';
import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../../domain/models/transaction-status.model';

@Injectable()
export class TransactionStatusHandler {
  constructor(
    @Inject(TRANSACTION_STATUS_API)
    private readonly statusApi: ITransactionStatusApi,
  ) {}

  getTransactionStatuses(): Promise<TransactionStatus[]> {
    return this.statusApi.getTransactionStatuses();
  }

  createTransactionStatus(
    input: CreateTransactionStatusInput,
  ): Promise<TransactionStatus> {
    return this.statusApi.createTransactionStatus(input);
  }
}
