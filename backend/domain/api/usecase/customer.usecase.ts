import type {
  CreateCustomerInput,
  Customer,
} from '../../models/customer.model';
import type { ICustomerPersistencePort } from '../../spi/customer.persistence.port';
import type { ICustomerApi } from '../customer.interface';

export class CustomerUseCase implements ICustomerApi {
  constructor(private readonly customerPersistence: ICustomerPersistencePort) {}

  getCustomers(): Promise<Customer[]> {
    return this.customerPersistence.getAll();
  }

  createCustomer(input: CreateCustomerInput): Promise<Customer> {
    return this.customerPersistence.create(input);
  }
}
