import { ApiProperty } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import type { CardModel } from '../../domain/models/card.model';
import type { Transaction } from '../../domain/models/transaction.model';
import { CreateCustomerDto, CustomerResponseDto } from './customer.dto';
import { CreateDeliveryDto, DeliveryResponseDto } from './delivery.dto';
import { OrderItemResponseDto } from './order-item.dto';
import { TransactionStatusResponseDto } from './transaction-status.dto';

export class TransactionCardDto implements CardModel {
  @ApiProperty({ example: '4242424242424242' })
  @IsString()
  @Matches(/^\d{13,19}$/)
  number!: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @Matches(/^\d{3,4}$/)
  cvc!: string;

  @ApiProperty({ example: '08' })
  @IsString()
  @Matches(/^\d{2}$/)
  exp_month!: string;

  @ApiProperty({ example: '28' })
  @IsString()
  @Matches(/^\d{2,4}$/)
  exp_year!: string;

  @ApiProperty({ example: 'José Pérez', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  card_holder!: string;
}

export class TransactionDeliveryDto extends OmitType(CreateDeliveryDto, [
  'transactionId',
] as const) {}

export class TransactionItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 100000 })
  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'PAY-2026-0001', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  paymentReference!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  statusId!: number;

  @ApiProperty({ type: CreateCustomerDto })
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer!: CreateCustomerDto;

  @ApiProperty({ type: TransactionDeliveryDto })
  @ValidateNested()
  @Type(() => TransactionDeliveryDto)
  delivery!: TransactionDeliveryDto;

  @ApiProperty({ type: TransactionItemDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items!: TransactionItemDto[];

  @ApiProperty({ type: TransactionCardDto })
  @ValidateNested()
  @Type(() => TransactionCardDto)
  card!: TransactionCardDto;
}

export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid!: string;

  @ApiProperty({ example: 'PAY-2026-0001' })
  paymentReference!: string;

  @ApiProperty({ example: 49.98, minimum: 0 })
  total!: number;

  @ApiProperty({ format: 'uuid' })
  customerId!: string;

  @ApiProperty({ example: 1 })
  statusId!: number;

  @ApiProperty({ type: CustomerResponseDto, nullable: true })
  customer!: CustomerResponseDto | null;

  @ApiProperty({ type: TransactionStatusResponseDto, nullable: true })
  status!: TransactionStatusResponseDto | null;

  @ApiProperty({ type: DeliveryResponseDto, nullable: true })
  delivery!: DeliveryResponseDto | null;

  @ApiProperty({ type: OrderItemResponseDto, isArray: true })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: '2026-09-25T15:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-09-25T15:00:00.000Z' })
  updatedAt!: string;

  constructor(transaction: Transaction) {
    this.uuid = transaction.uuid;
    this.paymentReference = transaction.paymentReference;
    this.total = transaction.total;
    this.customerId = transaction.customerId;
    this.statusId = transaction.statusId;
    this.customer = transaction.customer
      ? CustomerResponseDto.fromDomain(transaction.customer)
      : null;
    this.status = transaction.status
      ? TransactionStatusResponseDto.fromDomain(transaction.status)
      : null;
    this.delivery = transaction.delivery
      ? DeliveryResponseDto.fromDomain(transaction.delivery)
      : null;
    this.items = transaction.items.map((item) =>
      OrderItemResponseDto.fromDomain(item),
    );
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;
  }

  static fromDomain(transaction: Transaction): TransactionResponseDto {
    return new TransactionResponseDto(transaction);
  }
}
