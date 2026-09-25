import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class SeedProductsDto {
  @ApiProperty({
    description: 'Number of fake products to create when the table is empty.',
    example: 30,
    minimum: 1,
    maximum: 100,
    default: 30,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  count: number = 30;
}
