import { plainToInstance } from 'class-transformer';

import { CreateCustomerDto } from './customer.dto';
import {
  CreateTransactionDto,
  TransactionCardDto,
  TransactionDeliveryDto,
  TransactionItemDto,
} from './transaction.dto';

describe('CreateTransactionDto', () => {
  it('transforms nested transaction input into validated DTO instances', () => {
    const dto = plainToInstance(CreateTransactionDto, {
      paymentReference: 'PAY-1',
      statusId: 1,
      customer: {
        name: 'Ana',
        lastName: 'Gómez',
        identificationNumber: '123456789',
        email: 'ana@example.com',
      },
      delivery: {
        country: 'Colombia',
        city: 'Bogotá',
        locality: 'Chapinero',
        subLocality: 'Chapinero Alto',
        address: 'Calle 100 # 10-20',
        postalCode: '110111',
        additionalInfo: 'Apartamento 401',
      },
      items: [{ productId: 'product-id', quantity: 2 }],
      card: {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '08',
        exp_year: '28',
        card_holder: 'José Pérez',
      },
    });

    expect(dto.customer).toBeInstanceOf(CreateCustomerDto);
    expect(dto.delivery).toBeInstanceOf(TransactionDeliveryDto);
    expect(dto.items[0]).toBeInstanceOf(TransactionItemDto);
    expect(dto.card).toBeInstanceOf(TransactionCardDto);
  });
});
