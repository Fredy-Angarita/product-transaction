import { TransactionStatusEnum } from '../models/transaction-status.enum';

export class PaymentProviderError extends Error {
  constructor(
    readonly httpStatus: number,
    readonly transactionStatus: TransactionStatusEnum,
    message: string,
  ) {
    super(message);
    this.name = 'PaymentProviderError';
  }
}
