import { ApiProperty } from '@nestjs/swagger';

export class DeliveryFeeResponseDto {
  @ApiProperty({
    example: 15000,
    minimum: 0,
    description: 'Tarifa de envío en pesos enteros, sin centavos',
  })
  fee!: number;

  constructor(fee: number) {
    this.fee = fee;
  }

  static fromDomain(fee: number): DeliveryFeeResponseDto {
    return new DeliveryFeeResponseDto(fee);
  }
}
