import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import type { Customer } from '../../domain/models/customer.model';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ana', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'Gómez', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  lastName!: string;

  @ApiProperty({ example: '123456789', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  identificationNumber!: string;

  @ApiProperty({ example: 'ana@example.com', maxLength: 200 })
  @IsEmail()
  @MaxLength(200)
  email!: string;
}

export class CustomerResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Ana' })
  name!: string;

  @ApiProperty({ example: 'Gómez' })
  lastName!: string;

  @ApiProperty({ example: '123456789' })
  identificationNumber!: string;

  @ApiProperty({ example: 'ana@example.com' })
  email!: string;

  constructor(customer: Customer) {
    this.id = customer.id;
    this.name = customer.name;
    this.lastName = customer.lastName;
    this.identificationNumber = customer.identificationNumber;
    this.email = customer.email;
  }

  static fromDomain(customer: Customer): CustomerResponseDto {
    return new CustomerResponseDto(customer);
  }
}
