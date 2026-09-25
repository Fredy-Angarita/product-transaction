import { ApiProperty } from '@nestjs/swagger';

import type { Product } from '../../domain/models/product.model';

export class ProductResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '2c1c4e1d-6a1b-4f3f-9b0a-3f0d2c1a4b55',
  })
  id!: string;

  @ApiProperty({ example: 'Producto de ejemplo', maxLength: 150 })
  name!: string;

  @ApiProperty({ example: 'https://example.com/products/product.png' })
  image!: string;

  @ApiProperty({ example: 19.99, minimum: 0 })
  price!: number;

  @ApiProperty({ example: 10, minimum: 0 })
  quantity!: number;

  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.image = product.image;
    this.price = product.price;
    this.quantity = product.quantity;
  }

  static fromDomain(product: Product): ProductResponseDto {
    return new ProductResponseDto(product);
  }
}
