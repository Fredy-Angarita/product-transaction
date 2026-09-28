import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DeliveryFeeResponseDto } from '../../../../application/dtos/delivery-fee.response.dto';
import { DeliveryFeeHandler } from '../../../../application/handlers/delivery-fee.handler';

@ApiTags('delivery')
@Controller('delivery-fee')
export class DeliveryFeeController {
  constructor(private readonly deliveryFeeHandler: DeliveryFeeHandler) {}

  @Get()
  @ApiOperation({ summary: 'Quote the delivery fee' })
  @ApiOkResponse({ type: DeliveryFeeResponseDto })
  getDeliveryFee(): DeliveryFeeResponseDto {
    return DeliveryFeeResponseDto.fromDomain(
      this.deliveryFeeHandler.getDeliveryFee(),
    );
  }
}
