import type {
  CreateCustomerInput,
  Customer,
} from '../../../../../domain/models/customer.model';
import { CustomerEntity } from '../entity/customer.entity';

export class CustomerMapper {
  static toDomain(entity: CustomerEntity): Customer {
    return {
      id: entity.id,
      name: entity.name,
      lastName: entity.lastName,
      identificationNumber: entity.identificationNumber,
      email: entity.email,
    };
  }

  static toEntity(input: CreateCustomerInput): CustomerEntity {
    const entity = new CustomerEntity();
    entity.name = input.name;
    entity.lastName = input.lastName;
    entity.identificationNumber = input.identificationNumber;
    entity.email = input.email;
    return entity;
  }
}
