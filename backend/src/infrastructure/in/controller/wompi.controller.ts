import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { WompiAcceptableTermsResponseDto } from '../../../../application/dtos/wompi-acceptable-terms.response.dto';
import { WompiHandler } from '../../../../application/handlers/wompi.handler';

@ApiTags('wompi')
@Controller('wompi')
export class WompiController {
  constructor(private readonly wompiHandler: WompiHandler) {}

  @Get('acceptable-terms')
  @ApiOperation({ summary: 'Get Wompi acceptable terms' })
  @ApiOkResponse({ type: WompiAcceptableTermsResponseDto })
  async getAcceptableTerms(): Promise<WompiAcceptableTermsResponseDto> {
    const terms = await this.wompiHandler.getAcceptableTerms();
    return WompiAcceptableTermsResponseDto.fromDomain(terms);
  }
}
