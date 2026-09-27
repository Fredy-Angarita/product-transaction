import type {
  CreateTransactionPersistenceInput,
  Transaction,
} from '../../../../../domain/models/transaction.model';
import { TransactionStatusEnum } from '../../../../../domain/models/transaction-status.enum';
import { TransactionEntity } from '../entity/transaction.entity';
import { CustomerMapper } from './customer.mapper';
import { DeliveryMapper } from './delivery.mapper';
import { OrderItemMapper } from './order-item.mapper';

const toIsoString = (value: Date): string => value.toISOString();

export class TransactionMapper {
  static toDomain(entity: TransactionEntity): Transaction {
    return {
      uuid: entity.uuid,
      acceptanceToken: entity.acceptanceToken,
      acceptPersonalAuth: entity.acceptPersonalAuth,
      total: Number(entity.total),
      customerId: entity.customerId ?? entity.customer?.id ?? '',
      status: entity.status ?? TransactionStatusEnum.PENDING,
      customer: entity.customer
        ? CustomerMapper.toDomain(entity.customer)
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
      | 'total'
      | 'status'
      | 'acceptPersonalAuth'
      | 'acceptanceToken'
      | 'customerId'
    >,
  ): TransactionEntity {
    const entity = new TransactionEntity();
    entity.total = input.total;
    entity.status = input.status ?? TransactionStatusEnum.PENDING;
    entity.acceptPersonalAuth = input.acceptPersonalAuth;
    entity.acceptanceToken = input.acceptanceToken;
    entity.customerId = input.customerId;
    return entity;
  }
}
