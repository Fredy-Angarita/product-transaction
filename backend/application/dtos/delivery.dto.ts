import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import type { Delivery } from '../../domain/models/delivery.model';
import { TransactionReferenceResponseDto } from './transaction-reference.dto';

export class CreateDeliveryDto {
  @ApiProperty({ example: 'Colombia', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  country!: string;

  @ApiProperty({ example: 'Bogotá', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  city!: string;

  @ApiProperty({ example: 'Chapinero', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  locality!: string;

  @ApiProperty({ example: 'Chapinero Alto', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  subLocality!: string;

  @ApiProperty({ example: 'Calle 100 # 10-20' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: '110111', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  postalCode!: string;

  @ApiProperty({ example: 'Apartamento 401' })
  @IsString()
  @IsNotEmpty()
  additionalInfo!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  transactionId?: string;
}

export class DeliveryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Colombia' })
  country!: string;

  @ApiProperty({ example: 'Bogotá' })
  city!: string;

  @ApiProperty({ example: 'Chapinero' })
  locality!: string;

  @ApiProperty({ example: 'Chapinero Alto' })
  subLocality!: string;

  @ApiProperty({ example: 'Calle 100 # 10-20' })
  address!: string;

  @ApiProperty({ example: '110111' })
  postalCode!: string;

  @ApiProperty({ example: 'Apartamento 401' })
  additionalInfo!: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  transactionId!: string | null;

  @ApiPropertyOptional({
    type: TransactionReferenceResponseDto,
    nullable: true,
  })
  transaction!: TransactionReferenceResponseDto | null;

  constructor(delivery: Delivery) {
    this.id = delivery.id;
    this.country = delivery.country;
    this.city = delivery.city;
    this.locality = delivery.locality;
    this.subLocality = delivery.subLocality;
    this.address = delivery.address;
    this.postalCode = delivery.postalCode;
    this.additionalInfo = delivery.additionalInfo;
    this.transactionId = delivery.transactionId;
    this.transaction = delivery.transaction
      ? TransactionReferenceResponseDto.fromDomain(delivery.transaction)
      : null;
  }

  static fromDomain(delivery: Delivery): DeliveryResponseDto {
    return new DeliveryResponseDto(delivery);
  }
}
