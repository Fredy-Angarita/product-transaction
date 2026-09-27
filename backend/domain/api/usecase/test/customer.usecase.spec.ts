/* eslint-disable @typescript-eslint/unbound-method */
import type { ICustomerPersistencePort } from '../../../spi/customer.persistence.port';
import { CustomerUseCase } from '../customer.usecase';

const customer = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
};

const customerInput = {
  name: customer.name,
  lastName: customer.lastName,
  identificationNumber: customer.identificationNumber,
  email: customer.email,
};

const createCustomerPersistence =
  (): jest.Mocked<ICustomerPersistencePort> => ({
    getAll: jest.fn().mockResolvedValue([customer]),
    create: jest.fn().mockResolvedValue(customer),
  });

describe('CustomerUseCase', () => {
  it('lists and creates customers', async () => {
    const persistence = createCustomerPersistence();
    const useCase = new CustomerUseCase(persistence);

    await expect(useCase.getCustomers()).resolves.toEqual([customer]);
    await expect(useCase.createCustomer(customerInput)).resolves.toEqual(
      customer,
    );
    expect(persistence.create).toHaveBeenCalledWith(customerInput);
  });
});
