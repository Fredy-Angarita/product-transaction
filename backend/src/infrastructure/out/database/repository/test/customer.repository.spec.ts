jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import type { ObjectLiteral, Repository } from 'typeorm';

import { CustomerEntity } from '../../entity/customer.entity';
import { CustomerRepository } from '../customer.repository';

const customerEntity = {
  id: 'customer-id',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '123456789',
  email: 'ana@example.com',
} as unknown as CustomerEntity;

const customerInput = {
  name: customerEntity.name,
  lastName: customerEntity.lastName,
  identificationNumber: customerEntity.identificationNumber,
  email: customerEntity.email,
};

const createTypeOrmRepository = <T extends ObjectLiteral>(): {
  find: jest.Mock;
  findOne: jest.Mock;
  save: jest.Mock;
  repository: Repository<T>;
} => {
  const find = jest.fn();
  const findOne = jest.fn();
  const save = jest.fn();
  return {
    find,
    findOne,
    save,
    repository: { find, findOne, save } as unknown as Repository<T>,
  };
};

describe('CustomerRepository', () => {
  it('lists and creates customers', async () => {
    const {
      find,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<CustomerEntity>();
    find.mockResolvedValue([customerEntity]);
    save.mockResolvedValue(customerEntity);
    const repository = new CustomerRepository(typeOrm);

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ id: customerEntity.id }),
    ]);
    await expect(repository.create(customerInput)).resolves.toEqual(
      expect.objectContaining(customerInput),
    );
    expect(save).toHaveBeenCalledWith(expect.objectContaining(customerInput));
  });
});
