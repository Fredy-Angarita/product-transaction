import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateCustomerDto } from './customer.dto';
import {
  CreateTransactionDto,
  TransactionCardDto,
  TransactionDeliveryDto,
  TransactionItemDto,
} from './transaction.dto';

const validPayload = {
  acceptanceToken: 'token-abc123',
  acceptPersonalAuth: 'token-xyz789',
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
    fee: 15000,
  },
  items: [{ productId: '4f4e2c1a-9b1d-4a1e-8f2a-1c2d3e4f5a6b', quantity: 2 }],
  card: {
    number: '4242424242424242',
    cvc: '123',
    exp_month: '08',
    exp_year: '28',
    card_holder: 'José Pérez',
  },
};

describe('CreateTransactionDto', () => {
  it('transforms nested transaction input into validated DTO instances', () => {
    const dto = plainToInstance(CreateTransactionDto, validPayload);

    expect(dto.customer).toBeInstanceOf(CreateCustomerDto);
    expect(dto.delivery).toBeInstanceOf(TransactionDeliveryDto);
    expect(dto.items[0]).toBeInstanceOf(TransactionItemDto);
    expect(dto.card).toBeInstanceOf(TransactionCardDto);
  });

  it('accepts the delivery fee quoted by the client', async () => {
    const dto = plainToInstance(CreateTransactionDto, validPayload);

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.delivery.fee).toBe(15000);
  });

  it('rejects a transaction without a delivery fee', async () => {
    const delivery = { ...validPayload.delivery };
    delete (delivery as Partial<typeof delivery>).fee;
    const dto = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      delivery,
    });

    const errors = await validate(dto);

    expect(
      errors.flatMap((error) =>
        (error.children ?? []).flatMap((child) =>
          Object.values(child.constraints ?? {}),
        ),
      ),
    ).toContain('fee must be an integer number');
  });

  it('rejects a negative or out of range delivery fee', async () => {
    const negative = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      delivery: { ...validPayload.delivery, fee: -1 },
    });
    const tooBig = plainToInstance(CreateTransactionDto, {
      ...validPayload,
      delivery: { ...validPayload.delivery, fee: 50001 },
    });

    await expect(validate(negative)).resolves.not.toHaveLength(0);
    await expect(validate(tooBig)).resolves.not.toHaveLength(0);
  });
});
