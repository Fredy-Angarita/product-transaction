import { Inject, Injectable } from '@nestjs/common';

import { DELIVERY_API } from '../../domain/api/delivery.interface';
import type { IDeliveryApi } from '../../domain/api/delivery.interface';
import type {
  CreateDeliveryInput,
  Delivery,
} from '../../domain/models/delivery.model';

@Injectable()
export class DeliveryHandler {
  constructor(
    @Inject(DELIVERY_API)
    private readonly deliveryApi: IDeliveryApi,
  ) {}

  getDeliveries(): Promise<Delivery[]> {
    return this.deliveryApi.getDeliveries();
  }

  createDelivery(input: CreateDeliveryInput): Promise<Delivery> {
    return this.deliveryApi.createDelivery(input);
  }
}
