import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../../models/transaction-status.model';
import type { ITransactionStatusPersistencePort } from '../../spi/transaction-status.persistence.port';
import type { ITransactionStatusApi } from '../transaction-status.interface';

export class TransactionStatusUseCase implements ITransactionStatusApi {
  constructor(
    private readonly statusPersistence: ITransactionStatusPersistencePort,
  ) {}

  getTransactionStatuses(): Promise<TransactionStatus[]> {
    return this.statusPersistence.getAll();
  }

  createTransactionStatus(
    input: CreateTransactionStatusInput,
  ): Promise<TransactionStatus> {
    return this.statusPersistence.create(input);
  }
}
