import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from '../entity/product.entity';
import { ProductMapper } from '../mappers/product.mapper';
import { Product } from '../../../../../domain/models/product.model';
import { IProductPersistencePort } from '../../../../../domain/spi/product.persistence.port';

@Injectable()
export class ProductRepository implements IProductPersistencePort {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getAll(): Promise<Product[]> {
    const entities = await this.productRepository.find();
    return entities.map((e) => ProductMapper.toDomain(e));
  }

  async saveAll(products: Product[]): Promise<void> {
    const entities = products.map((p) => ProductMapper.toEntity(p));
    await this.productRepository.save(entities);
  }
}
