import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

import type { OrderItem } from '../../domain/models/order-item.model';
import { ProductResponseDto } from './product.response.dto';

export class CreateOrderItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  transactionId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 19.99, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiProperty({ example: 2, minimum: 1, maximum: 100000 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;
}

export class OrderItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  transactionId!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: 19.99, minimum: 0 })
  price!: number;

  @ApiProperty({ example: 2, minimum: 1 })
  quantity!: number;

  @ApiPropertyOptional({ type: ProductResponseDto, nullable: true })
  product!: ProductResponseDto | null;

  constructor(item: OrderItem) {
    this.id = item.id;
    this.transactionId = item.transactionId;
    this.productId = item.productId;
    this.price = item.price;
    this.quantity = item.quantity;
    this.product = item.product
      ? ProductResponseDto.fromDomain(item.product)
      : null;
  }

  static fromDomain(item: OrderItem): OrderItemResponseDto {
    return new OrderItemResponseDto(item);
  }
}
