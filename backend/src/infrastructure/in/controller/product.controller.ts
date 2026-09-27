import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProductResponseDto } from '../../../../application/dtos/product.response.dto';
import { ProductHandler } from '../../../../application/handlers/product.handler';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productHandler: ProductHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiOkResponse({
    description: 'List of available products.',
    type: ProductResponseDto,
    isArray: true,
  })
  async getProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productHandler.getProducts();
    return products.map((product) => ProductResponseDto.fromDomain(product));
  }
}
