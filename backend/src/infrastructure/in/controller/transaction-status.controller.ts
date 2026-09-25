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
  CreateTransactionStatusDto,
  TransactionStatusResponseDto,
} from '../../../../application/dtos/transaction-status.dto';
import { TransactionStatusHandler } from '../../../../application/handlers/transaction-status.handler';

@ApiTags('transaction-statuses')
@Controller('transaction-statuses')
export class TransactionStatusController {
  constructor(private readonly statusHandler: TransactionStatusHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all transaction statuses' })
  @ApiOkResponse({ type: TransactionStatusResponseDto, isArray: true })
  async getTransactionStatuses(): Promise<TransactionStatusResponseDto[]> {
    const statuses = await this.statusHandler.getTransactionStatuses();
    return statuses.map((status) =>
      TransactionStatusResponseDto.fromDomain(status),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transaction status' })
  @ApiBody({ type: CreateTransactionStatusDto })
  @ApiCreatedResponse({ type: TransactionStatusResponseDto })
  async createTransactionStatus(
    @Body() dto: CreateTransactionStatusDto,
  ): Promise<TransactionStatusResponseDto> {
    const status = await this.statusHandler.createTransactionStatus(dto);
    return TransactionStatusResponseDto.fromDomain(status);
  }
}
