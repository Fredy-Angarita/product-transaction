import type {
  CreateProductInput,
  Product,
} from '../../../../../domain/models/product.model';
import { ProductEntity } from '../entity/product.entity';

export class ProductMapper {
  static toDomain(entity: ProductEntity): Product {
    return {
      id: entity.id,
      name: entity.name,
      image: entity.image,
      price: Number(entity.price),
      quantity: entity.quantity,
    };
  }

  static toEntity(product: Product | CreateProductInput): ProductEntity {
    const entity = new ProductEntity();
    entity.name = product.name;
    entity.image = product.image;
    entity.price = product.price;
    entity.quantity = product.quantity;
    return entity;
  }
}
