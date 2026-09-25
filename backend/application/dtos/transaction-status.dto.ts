import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import type { TransactionStatus } from '../../domain/models/transaction-status.model';

export class CreateTransactionStatusDto {
  @ApiProperty({ example: 'PENDING', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status!: string;
}

export class TransactionStatusResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'PENDING' })
  status!: string;

  constructor(status: TransactionStatus) {
    this.id = status.id;
    this.status = status.status;
  }

  static fromDomain(status: TransactionStatus): TransactionStatusResponseDto {
    return new TransactionStatusResponseDto(status);
  }
}
