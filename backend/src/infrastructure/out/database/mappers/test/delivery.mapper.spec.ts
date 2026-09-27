import { DeliveryEntity } from '../../entity/delivery.entity';
import { DeliveryMapper } from '../delivery.mapper';

const delivery = {
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
    total: '39.98',
  },
} as unknown as DeliveryEntity;

describe('DeliveryMapper', () => {
  it('maps a delivery and its transaction reference', () => {
    expect(DeliveryMapper.toDomain(delivery)).toEqual({
      id: delivery.id,
      country: delivery.country,
      city: delivery.city,
      locality: delivery.locality,
      subLocality: delivery.subLocality,
      address: delivery.address,
      postalCode: delivery.postalCode,
      additionalInfo: delivery.additionalInfo,
      transactionId: 'transaction-id',
      transaction: {
        uuid: 'transaction-id',
        total: 39.98,
      },
    });
  });

  it('maps a delivery without a transaction', () => {
    const entity = {
      ...delivery,
      transactionId: null,
      transaction: null,
    } as unknown as DeliveryEntity;

    expect(DeliveryMapper.toDomain(entity).transaction).toBeNull();
    expect(DeliveryMapper.toDomain(entity).transactionId).toBeNull();
  });

  it('maps delivery input to an entity', () => {
    const input = {
      country: delivery.country,
      city: delivery.city,
      locality: delivery.locality,
      subLocality: delivery.subLocality,
      address: delivery.address,
      postalCode: delivery.postalCode,
      additionalInfo: delivery.additionalInfo,
      transactionId: null,
    };

    expect(DeliveryMapper.toEntity(input)).toEqual(
      expect.objectContaining(input),
    );
  });
});
