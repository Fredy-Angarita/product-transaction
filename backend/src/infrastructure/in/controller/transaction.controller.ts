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
  CreateTransactionDto,
  TransactionResponseDto,
} from '../../../../application/dtos/transaction.dto';
import { TransactionHandler } from '../../../../application/handlers/transaction.handler';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionHandler: TransactionHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  async getTransactions(): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionHandler.getTransactions();
    return transactions.map((transaction) =>
      TransactionResponseDto.fromDomain(transaction),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionHandler.createTransaction(dto);
    return TransactionResponseDto.fromDomain(transaction);
  }
}
