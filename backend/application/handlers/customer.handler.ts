import { Inject, Injectable } from '@nestjs/common';

import { CUSTOMER_API } from '../../domain/api/customer.interface';
import type { ICustomerApi } from '../../domain/api/customer.interface';
import type {
  CreateCustomerInput,
  Customer,
} from '../../domain/models/customer.model';

@Injectable()
export class CustomerHandler {
  constructor(
    @Inject(CUSTOMER_API)
    private readonly customerApi: ICustomerApi,
  ) {}

  getCustomers(): Promise<Customer[]> {
    return this.customerApi.getCustomers();
  }

  createCustomer(input: CreateCustomerInput): Promise<Customer> {
    return this.customerApi.createCustomer(input);
  }
}
