import type {
  CreateDeliveryInput,
  Delivery,
} from '../../../../../domain/models/delivery.model';
import { DeliveryEntity } from '../entity/delivery.entity';

export class DeliveryMapper {
  static toDomain(entity: DeliveryEntity): Delivery {
    return {
      id: entity.id,
      country: entity.country,
      city: entity.city,
      locality: entity.locality,
      subLocality: entity.subLocality,
      address: entity.address,
      postalCode: entity.postalCode,
      additionalInfo: entity.additionalInfo,
      transactionId: entity.transactionId ?? entity.transaction?.uuid ?? null,
      transaction: entity.transaction
        ? {
            uuid: entity.transaction.uuid,
            paymentReference: entity.transaction.paymentReference,
            total: Number(entity.transaction.total),
          }
        : null,
    };
  }

  static toEntity(input: CreateDeliveryInput): DeliveryEntity {
    const entity = new DeliveryEntity();
    entity.country = input.country;
    entity.city = input.city;
    entity.locality = input.locality;
    entity.subLocality = input.subLocality;
    entity.address = input.address;
    entity.postalCode = input.postalCode;
    entity.additionalInfo = input.additionalInfo;
    entity.transactionId = input.transactionId;
    return entity;
  }
}
