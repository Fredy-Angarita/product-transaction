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
  CreateCustomerDto,
  CustomerResponseDto,
} from '../../../../application/dtos/customer.dto';
import { CustomerHandler } from '../../../../application/handlers/customer.handler';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerHandler: CustomerHandler) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiOkResponse({ type: CustomerResponseDto, isArray: true })
  async getCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.customerHandler.getCustomers();
    return customers.map((customer) =>
      CustomerResponseDto.fromDomain(customer),
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a customer' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  async createCustomer(
    @Body() dto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerHandler.createCustomer(dto);
    return CustomerResponseDto.fromDomain(customer);
  }
}
