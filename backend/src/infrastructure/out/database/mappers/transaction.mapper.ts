import type {
  CreateTransactionPersistenceInput,
  Transaction,
} from '../../../../../domain/models/transaction.model';
import { TransactionEntity } from '../entity/transaction.entity';
import { CustomerMapper } from './customer.mapper';
import { DeliveryMapper } from './delivery.mapper';
import { OrderItemMapper } from './order-item.mapper';
import { TransactionStatusMapper } from './transaction-status.mapper';

const toIsoString = (value: Date): string => value.toISOString();

export class TransactionMapper {
  static toDomain(entity: TransactionEntity): Transaction {
    return {
      uuid: entity.uuid,
      paymentReference: entity.paymentReference,
      total: Number(entity.total),
      customerId: entity.customerId ?? entity.customer?.id ?? '',
      statusId: entity.statusId ?? entity.status?.id ?? 0,
      customer: entity.customer
        ? CustomerMapper.toDomain(entity.customer)
        : null,
      status: entity.status
        ? TransactionStatusMapper.toDomain(entity.status)
        : null,
      delivery: entity.delivery
        ? DeliveryMapper.toDomain(entity.delivery)
        : null,
      items: entity.items?.map((item) => OrderItemMapper.toDomain(item)) ?? [],
      createdAt: toIsoString(entity.createdAt),
      updatedAt: toIsoString(entity.updatedAt),
    };
  }

  static toEntity(
    input: Pick<
      CreateTransactionPersistenceInput,
      'paymentReference' | 'total' | 'statusId'
    >,
  ): TransactionEntity {
    const entity = new TransactionEntity();
    entity.paymentReference = input.paymentReference;
    entity.total = input.total;
    entity.statusId = input.statusId;
    return entity;
  }
}
