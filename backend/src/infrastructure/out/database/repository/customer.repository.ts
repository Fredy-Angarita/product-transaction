import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  CreateCustomerInput,
  Customer,
} from '../../../../../domain/models/customer.model';
import type { ICustomerPersistencePort } from '../../../../../domain/spi/customer.persistence.port';
import { CustomerEntity } from '../entity/customer.entity';
import { CustomerMapper } from '../mappers/customer.mapper';

@Injectable()
export class CustomerRepository implements ICustomerPersistencePort {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async getAll(): Promise<Customer[]> {
    const entities = await this.customerRepository.find();
    return entities.map((entity) => CustomerMapper.toDomain(entity));
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const entity = CustomerMapper.toEntity(input);
    const saved = await this.customerRepository.save(entity);
    return CustomerMapper.toDomain(saved);
  }
}
