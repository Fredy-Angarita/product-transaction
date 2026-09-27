import { ApiProperty } from '@nestjs/swagger';

import type { TransactionReference } from '../../domain/models/transaction-reference.model';

export class TransactionReferenceResponseDto {
  @ApiProperty({ format: 'uuid' })
  uuid!: string;

  @ApiProperty({ example: 49.98, minimum: 0 })
  total!: number;

  constructor(transaction: TransactionReference) {
    this.uuid = transaction.uuid;
    this.total = transaction.total;
  }

  static fromDomain(
    transaction: TransactionReference,
  ): TransactionReferenceResponseDto {
    return new TransactionReferenceResponseDto(transaction);
  }
}
