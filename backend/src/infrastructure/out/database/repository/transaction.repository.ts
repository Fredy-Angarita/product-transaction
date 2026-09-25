import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, MoreThanOrEqual, Repository } from 'typeorm';

import { InsufficientStockError } from '../../../../../domain/errors/insufficient-stock.error';
import type {
  CreateTransactionPersistenceInput,
  Transaction,
} from '../../../../../domain/models/transaction.model';
import type { ITransactionPersistencePort } from '../../../../../domain/spi/transaction.persistence.port';
import { CustomerEntity } from '../entity/customer.entity';
import { DeliveryEntity } from '../entity/delivery.entity';
import { ProductEntity } from '../entity/product.entity';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { TransactionEntity } from '../entity/transaction.entity';
import { CustomerMapper } from '../mappers/customer.mapper';
import { DeliveryMapper } from '../mappers/delivery.mapper';
import { TransactionMapper } from '../mappers/transaction.mapper';
import { OrderItemRepository } from './order-item.repository';

@Injectable()
export class TransactionRepository implements ITransactionPersistencePort {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly dataSource: DataSource,
    private readonly orderItemRepository: OrderItemRepository,
  ) {}

  async getAll(): Promise<Transaction[]> {
    const entities = await this.transactionRepository.find({
      relations: {
        customer: true,
        status: true,
        delivery: true,
        items: { product: true },
      },
    });
    return entities.map((entity) => TransactionMapper.toDomain(entity));
  }

  async getById(uuid: string): Promise<Transaction | null> {
    const entity = await this.transactionRepository.findOne({
      where: { uuid },
      relations: {
        customer: true,
        status: true,
        delivery: true,
        items: { product: true },
      },
    });

    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async create(input: CreateTransactionPersistenceInput): Promise<Transaction> {
    return this.dataSource.transaction(async (manager) => {
      for (const item of input.items) {
        const updateResult = await manager.decrement(
          ProductEntity,
          {
            id: item.productId,
            quantity: MoreThanOrEqual(item.quantity),
          },
          'quantity',
          item.quantity,
        );

        if (updateResult.affected !== 1) {
          const product = await manager.findOneBy(ProductEntity, {
            id: item.productId,
          });

          throw new InsufficientStockError(
            item.productId,
            item.quantity,
            product?.quantity ?? 0,
          );
        }
      }

      const customer = await manager.save(
        CustomerEntity,
        CustomerMapper.toEntity(input.customer),
      );

      const transactionEntity = TransactionMapper.toEntity(input);
      transactionEntity.customerId = customer.id;
      const savedTransaction = await manager.save(
        TransactionEntity,
        transactionEntity,
      );

      const delivery = await manager.save(
        DeliveryEntity,
        DeliveryMapper.toEntity({
          ...input.delivery,
          transactionId: savedTransaction.uuid,
        }),
      );

      const savedItems = await this.orderItemRepository.saveAll(
        manager,
        input.items.map((item) => ({
          ...item,
          transactionId: savedTransaction.uuid,
        })),
      );

      const [status, products] = await Promise.all([
        manager.findOneBy(TransactionStatusEntity, { id: input.statusId }),
        manager.findBy(ProductEntity, {
          id: In(input.items.map((item) => item.productId)),
        }),
      ]);
      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      savedTransaction.customer = customer;
      savedTransaction.status = status;
      savedTransaction.delivery = delivery;
      savedTransaction.items = savedItems.map((item) => {
        item.product = productsById.get(item.productId) ?? null;
        return item;
      });

      const persisted = await manager.findOne(TransactionEntity, {
        where: { uuid: savedTransaction.uuid },
        relations: {
          customer: true,
          status: true,
          delivery: true,
          items: { product: true },
        },
      });

      return persisted
        ? TransactionMapper.toDomain(persisted)
        : TransactionMapper.toDomain(savedTransaction);
    });
  }
}
