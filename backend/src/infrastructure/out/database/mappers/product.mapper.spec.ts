import type { Product } from '../../../../../domain/models/product.model';
import { ProductEntity } from '../entity/product.entity';
import { ProductMapper } from './product.mapper';

describe('ProductMapper', () => {
  it('maps a product entity to the domain model', () => {
    const entity = {
      id: 'product-id',
      name: 'Product',
      image: 'https://example.com/product.png',
      price: '19.99',
      quantity: 2,
    } as unknown as ProductEntity;

    expect(ProductMapper.toDomain(entity)).toEqual({
      id: 'product-id',
      name: 'Product',
      image: 'https://example.com/product.png',
      price: 19.99,
      quantity: 2,
    });
  });

  it('maps a domain product to an entity', () => {
    const product: Product = {
      id: 'product-id',
      name: 'Product',
      image: 'https://example.com/product.png',
      price: 19.99,
      quantity: 2,
    };

    expect(ProductMapper.toEntity(product)).toEqual(
      expect.objectContaining({
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: product.quantity,
      }),
    );
  });
});
