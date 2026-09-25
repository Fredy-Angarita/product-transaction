import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type {
  CreateProductInput,
  Product,
} from '../../../../../domain/models/product.model';
import type { IProductPersistencePort } from '../../../../../domain/spi/product.persistence.port';
import { ProductEntity } from '../entity/product.entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRepository implements IProductPersistencePort {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getAll(): Promise<Product[]> {
    const entities = await this.productRepository.find();
    return entities.map((entity) => ProductMapper.toDomain(entity));
  }

  async getById(id: string): Promise<Product | null> {
    const entity = await this.productRepository.findOne({ where: { id } });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const entity = ProductMapper.toEntity(input);
    const saved = await this.productRepository.save(entity);
    return ProductMapper.toDomain(saved);
  }

  async saveAll(products: Product[]): Promise<void> {
    const entities = products.map((product) => ProductMapper.toEntity(product));
    await this.productRepository.save(entities);
  }
}
