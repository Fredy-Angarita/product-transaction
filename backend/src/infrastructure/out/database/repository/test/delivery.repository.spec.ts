jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import type { ObjectLiteral, Repository } from 'typeorm';

import { DeliveryEntity } from '../../entity/delivery.entity';
import { DeliveryRepository } from '../delivery.repository';

const deliveryEntity = {
  id: 'delivery-id',
  country: 'Colombia',
  city: 'Bogotá',
  locality: 'Chapinero',
  subLocality: 'Chapinero Alto',
  address: 'Calle 100 # 10-20',
  postalCode: '110111',
  additionalInfo: 'Apartamento 401',
  transactionId: 'transaction-id',
  transaction: {
    uuid: 'transaction-id',
    paymentReference: 'PAY-1',
    total: '39.98',
  },
} as unknown as DeliveryEntity;

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

describe('DeliveryRepository', () => {
  it('lists and creates deliveries', async () => {
    const {
      find,
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<DeliveryEntity>();
    find.mockResolvedValue([deliveryEntity]);
    findOne.mockResolvedValue(deliveryEntity);
    save.mockResolvedValue(deliveryEntity);
    const repository = new DeliveryRepository(typeOrm);
    const input = {
      country: deliveryEntity.country,
      city: deliveryEntity.city,
      locality: deliveryEntity.locality,
      subLocality: deliveryEntity.subLocality,
      address: deliveryEntity.address,
      postalCode: deliveryEntity.postalCode,
      additionalInfo: deliveryEntity.additionalInfo,
      transactionId: deliveryEntity.transactionId,
    };

    await expect(repository.getAll()).resolves.toEqual([
      expect.objectContaining({ id: deliveryEntity.id }),
    ]);
    await expect(repository.create(input)).resolves.toEqual(
      expect.objectContaining(input),
    );
  });

  it('returns null when a delivery does not exist', async () => {
    const { findOne, repository: typeOrm } =
      createTypeOrmRepository<DeliveryEntity>();
    findOne.mockResolvedValue(null);

    await expect(
      new DeliveryRepository(typeOrm).getById('missing'),
    ).resolves.toBeNull();
  });

  it('returns the saved delivery when it cannot be reloaded', async () => {
    const {
      findOne,
      save,
      repository: typeOrm,
    } = createTypeOrmRepository<DeliveryEntity>();
    findOne.mockResolvedValue(null);
    save.mockResolvedValue({ ...deliveryEntity, transaction: null });
    const input = {
      country: deliveryEntity.country,
      city: deliveryEntity.city,
      locality: deliveryEntity.locality,
      subLocality: deliveryEntity.subLocality,
      address: deliveryEntity.address,
      postalCode: deliveryEntity.postalCode,
      additionalInfo: deliveryEntity.additionalInfo,
      transactionId: deliveryEntity.transactionId,
    };

    await expect(
      new DeliveryRepository(typeOrm).create(input),
    ).resolves.toEqual(
      expect.objectContaining({ id: deliveryEntity.id, transaction: null }),
    );
  });
});
