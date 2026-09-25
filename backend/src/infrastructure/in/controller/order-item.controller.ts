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

import {
  CreateOrderItemDto,
  OrderItemResponseDto,
} from '../../../../application/dtos/order-item.dto';
import { OrderItemHandler } from '../../../../application/handlers/order-item.handler';

@ApiTags('order-items')
@Controller('order-items')
export class OrderItemController {
  constructor(private readonly orderItemHandler: OrderItemHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all order items' })
  @ApiOkResponse({ type: OrderItemResponseDto, isArray: true })
  async getOrderItems(): Promise<OrderItemResponseDto[]> {
    const items = await this.orderItemHandler.getOrderItems();
    return items.map((item) => OrderItemResponseDto.fromDomain(item));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order item' })
  @ApiBody({ type: CreateOrderItemDto })
  @ApiCreatedResponse({ type: OrderItemResponseDto })
  async createOrderItem(
    @Body() dto: CreateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    const item = await this.orderItemHandler.createOrderItem(dto);
    return OrderItemResponseDto.fromDomain(item);
  }
}
