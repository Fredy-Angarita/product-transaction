import { ApiProperty } from '@nestjs/swagger';

export class SeedProductsResponseDto {
  @ApiProperty({
    description: 'Number of products inserted by the seed operation.',
    example: 30,
    minimum: 0,
  })
  inserted!: number;

  constructor(inserted: number) {
    this.inserted = inserted;
  }
}
