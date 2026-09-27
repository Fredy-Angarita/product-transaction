export interface Customer {
  id: string;
  name: string;
  lastName: string;
  identificationNumber: string;
  email: string;
}

export type CreateCustomerInput = Omit<Customer, 'id'>;
