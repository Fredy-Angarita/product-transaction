import type { Product } from '../../domain/models/product.model';
import { ProductResponseDto } from './product.response.dto';

describe('ProductResponseDto', () => {
  it('maps all product fields from the domain', () => {
    const product: Product = {
      id: 'product-id',
      name: 'Product',
      image: 'https://example.com/product.png',
      price: 19.99,
      quantity: 4,
    };

    expect(ProductResponseDto.fromDomain(product)).toEqual(product);
  });
});
