import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  CreateTransactionPersistenceInput,
  Transaction,
} from '../../../../../domain/models/transaction.model';
import type { ITransactionPersistencePort } from '../../../../../domain/spi/transaction.persistence.port';
import { TransactionEntity } from '../entity/transaction.entity';
import { TransactionMapper } from '../mappers/transaction.mapper';

@Injectable()
export class TransactionRepository implements ITransactionPersistencePort {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
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
    const entity = TransactionMapper.toEntity(input);
    const saved = await this.transactionRepository.save(entity);
    return TransactionMapper.toDomain(saved);
  }

  async updateStatus(uuid: string, statusId: number): Promise<void> {
    await this.transactionRepository.update({ uuid }, { statusId });
  }
}
