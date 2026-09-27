import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  CreateTransactionStatusInput,
  TransactionStatus,
} from '../../../../../domain/models/transaction-status.model';
import type { ITransactionStatusPersistencePort } from '../../../../../domain/spi/transaction-status.persistence.port';
import { TransactionStatusEntity } from '../entity/transaction.status.entity';
import { TransactionStatusMapper } from '../mappers/transaction-status.mapper';

@Injectable()
export class TransactionStatusRepository implements ITransactionStatusPersistencePort {
  constructor(
    @InjectRepository(TransactionStatusEntity)
    private readonly statusRepository: Repository<TransactionStatusEntity>,
  ) {}

  async getAll(): Promise<TransactionStatus[]> {
    const entities = await this.statusRepository.find();
    return entities.map((entity) => TransactionStatusMapper.toDomain(entity));
  }

  async getById(id: number): Promise<TransactionStatus | null> {
    const entity = await this.statusRepository.findOne({ where: { id } });
    return entity ? TransactionStatusMapper.toDomain(entity) : null;
  }

  async create(
    input: CreateTransactionStatusInput,
  ): Promise<TransactionStatus> {
    const entity = TransactionStatusMapper.toEntity(input);
    const saved = await this.statusRepository.save(entity);
    return TransactionStatusMapper.toDomain(saved);
  }
}
