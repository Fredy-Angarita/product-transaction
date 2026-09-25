import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import type {
  CreateOrderItemInput,
  OrderItem,
} from '../../../../../domain/models/order-item.model';
import type { IOrderItemPersistencePort } from '../../../../../domain/spi/order-item.persistence.port';
import { OrderItemEntity } from '../entity/order.item.entity';
import { OrderItemMapper } from '../mappers/order-item.mapper';

@Injectable()
export class OrderItemRepository implements IOrderItemPersistencePort {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async getAll(): Promise<OrderItem[]> {
    const entities = await this.orderItemRepository.find({
      relations: { product: true },
    });
    return entities.map((entity) => OrderItemMapper.toDomain(entity));
  }

  async getById(id: string): Promise<OrderItem | null> {
    const entity = await this.orderItemRepository.findOne({
      where: { id },
      relations: { product: true },
    });

    return entity ? OrderItemMapper.toDomain(entity) : null;
  }

  async create(input: CreateOrderItemInput): Promise<OrderItem> {
    const entity = OrderItemMapper.toEntity(input);
    const saved = await this.orderItemRepository.save(entity);
    const persisted = await this.getById(saved.id);

    return persisted ?? OrderItemMapper.toDomain(saved);
  }

  async saveAll(
    manager: EntityManager,
    input: CreateOrderItemInput[],
  ): Promise<OrderItemEntity[]> {
    const entities = input.map((item) => OrderItemMapper.toEntity(item));
    return manager.save(OrderItemEntity, entities);
  }
}
