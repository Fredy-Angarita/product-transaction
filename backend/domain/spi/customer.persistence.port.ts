import type { CreateCustomerInput, Customer } from '../models/customer.model';

export const CUSTOMER_PERSISTENCE_PORT = Symbol('CUSTOMER_PERSISTENCE_PORT');

export interface ICustomerPersistencePort {
  getAll(): Promise<Customer[]>;
  create(input: CreateCustomerInput): Promise<Customer>;
}
