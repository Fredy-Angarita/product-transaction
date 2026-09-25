import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  CreateDeliveryInput,
  Delivery,
} from '../../../../../domain/models/delivery.model';
import type { IDeliveryPersistencePort } from '../../../../../domain/spi/delivery.persistence.port';
import { DeliveryEntity } from '../entity/delivery.entity';
import { DeliveryMapper } from '../mappers/delivery.mapper';

@Injectable()
export class DeliveryRepository implements IDeliveryPersistencePort {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly deliveryRepository: Repository<DeliveryEntity>,
  ) {}

  async getAll(): Promise<Delivery[]> {
    const entities = await this.deliveryRepository.find({
      relations: { transaction: true },
    });
    return entities.map((entity) => DeliveryMapper.toDomain(entity));
  }

  async getById(id: string): Promise<Delivery | null> {
    const entity = await this.deliveryRepository.findOne({
      where: { id },
      relations: { transaction: true },
    });

    return entity ? DeliveryMapper.toDomain(entity) : null;
  }

  async create(input: CreateDeliveryInput): Promise<Delivery> {
    const entity = DeliveryMapper.toEntity(input);
    const saved = await this.deliveryRepository.save(entity);
    const persisted = await this.getById(saved.id);

    return persisted ?? DeliveryMapper.toDomain(saved);
  }
}
