import type {
  CreateCustomerInput,
  Customer,
} from '../../../../../../domain/models/customer.model';
import { CustomerEntity } from '../../entity/customer.entity';
import { CustomerMapper } from '../customer.mapper';

const customerInput: CreateCustomerInput = {
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
};

const customer: Customer = { id: 'customer-id', ...customerInput };
const customerEntity = customer as unknown as CustomerEntity;

describe('CustomerMapper', () => {
  it('maps a customer entity to the domain and back', () => {
    expect(CustomerMapper.toDomain(customerEntity)).toEqual(customer);
    expect(CustomerMapper.toEntity(customerInput)).toEqual(
      expect.objectContaining(customerInput),
    );
  });
});
