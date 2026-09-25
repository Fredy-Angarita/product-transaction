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
  CreateDeliveryDto,
  DeliveryResponseDto,
} from '../../../../application/dtos/delivery.dto';
import { DeliveryHandler } from '../../../../application/handlers/delivery.handler';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveryController {
  constructor(private readonly deliveryHandler: DeliveryHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all deliveries' })
  @ApiOkResponse({ type: DeliveryResponseDto, isArray: true })
  async getDeliveries(): Promise<DeliveryResponseDto[]> {
    const deliveries = await this.deliveryHandler.getDeliveries();
    return deliveries.map((delivery) =>
      DeliveryResponseDto.fromDomain(delivery),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a delivery' })
  @ApiBody({ type: CreateDeliveryDto })
  @ApiCreatedResponse({ type: DeliveryResponseDto })
  async createDelivery(
    @Body() dto: CreateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveryHandler.createDelivery({
      ...dto,
      transactionId: dto.transactionId ?? null,
    });
    return DeliveryResponseDto.fromDomain(delivery);
  }
}
