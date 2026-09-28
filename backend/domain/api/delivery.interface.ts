import type { CreateDeliveryInput, Delivery } from '../models/delivery.model';

export const DELIVERY_API = Symbol('DELIVERY_API');

export interface IDeliveryApi {
  getDeliveries(): Promise<Delivery[]>;
  createDelivery(input: CreateDeliveryInput): Promise<Delivery>;
}
