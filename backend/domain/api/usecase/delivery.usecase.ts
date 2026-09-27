import { ResourceNotFoundError } from '../../errors/resource-not-found.error';
import type {
  CreateDeliveryInput,
  Delivery,
} from '../../models/delivery.model';
import type { IDeliveryPersistencePort } from '../../spi/delivery.persistence.port';
import type { ITransactionPersistencePort } from '../../spi/transaction.persistence.port';
import type { IDeliveryApi } from '../delivery.interface';

export class DeliveryUseCase implements IDeliveryApi {
  constructor(
    private readonly deliveryPersistence: IDeliveryPersistencePort,
    private readonly transactionPersistence: ITransactionPersistencePort,
  ) {}

  getDeliveries(): Promise<Delivery[]> {
    return this.deliveryPersistence.getAll();
  }

  async createDelivery(input: CreateDeliveryInput): Promise<Delivery> {
    if (input.transactionId) {
      const transaction = await this.transactionPersistence.getById(
        input.transactionId,
      );

      if (!transaction) {
        throw new ResourceNotFoundError('Transaction', input.transactionId);
      }
    }

    return this.deliveryPersistence.create(input);
  }
}
