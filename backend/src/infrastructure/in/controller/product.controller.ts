import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProductDto } from '../../../../application/dtos/create-product.dto';
import { ProductResponseDto } from '../../../../application/dtos/product.response.dto';
import { SeedProductsDto } from '../../../../application/dtos/seed-products.dto';
import { SeedProductsResponseDto } from '../../../../application/dtos/seed-products-response.dto';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({ type: ProductResponseDto })
  async createProduct(
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productHandler.createProduct(dto);
    return ProductResponseDto.fromDomain(product);
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seed fake products when the product table is empty',
  })
  @ApiBody({ type: SeedProductsDto })
  @ApiOkResponse({
    description: 'Number of fake products inserted.',
    type: SeedProductsResponseDto,
  })
  async seedProducts(
    @Body() dto: SeedProductsDto,
  ): Promise<SeedProductsResponseDto> {
    const inserted = await this.productHandler.seedProducts(dto.count);
    return new SeedProductsResponseDto(inserted);
  }
}
