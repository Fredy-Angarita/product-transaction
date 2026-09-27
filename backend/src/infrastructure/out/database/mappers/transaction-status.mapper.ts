import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../../../../../domain/models/transaction-status.model';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';

export class TransactionStatusMapper {
  static toDomain(entity: TransactionStatusEntity): TransactionStatus {
    return {
      id: entity.id,
      status: entity.status,
    };
  }

  static toEntity(
    input: CreateTransactionStatusInput,
  ): TransactionStatusEntity {
    const entity = new TransactionStatusEntity();
    entity.status = input.status;
    return entity;
  }
}
