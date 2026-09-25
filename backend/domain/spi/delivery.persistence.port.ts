import type { CreateDeliveryInput, Delivery } from '../models/delivery.model';

export const DELIVERY_PERSISTENCE_PORT = Symbol('DELIVERY_PERSISTENCE_PORT');

export interface IDeliveryPersistencePort {
  getAll(): Promise<Delivery[]>;
  create(input: CreateDeliveryInput): Promise<Delivery>;
}
