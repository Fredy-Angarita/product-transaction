import type { CreateCustomerInput, Customer } from '../models/customer.model';

export const CUSTOMER_API = Symbol('CUSTOMER_API');

export interface ICustomerApi {
  getCustomers(): Promise<Customer[]>;
  createCustomer(input: CreateCustomerInput): Promise<Customer>;
}
