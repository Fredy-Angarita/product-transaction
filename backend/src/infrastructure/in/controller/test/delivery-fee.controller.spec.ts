import { DeliveryFeeHandler } from '../../../../../application/handlers/delivery-fee.handler';
import { DeliveryFeeController } from '../delivery-fee.controller';

describe('DeliveryFeeController', () => {
  it('returns the fee exposed by the handler', () => {
    const handler = {
      getDeliveryFee: jest.fn().mockReturnValue(15000),
    } as unknown as DeliveryFeeHandler;
    const controller = new DeliveryFeeController(handler);

    expect(controller.getDeliveryFee()).toEqual({ fee: 15000 });
  });

  it('propagates handler errors', () => {
    const error = new Error('handler unavailable');
    const handler = {
      getDeliveryFee: jest.fn(() => {
        throw error;
      }),
    } as unknown as DeliveryFeeHandler;
    const controller = new DeliveryFeeController(handler);

    expect(() => controller.getDeliveryFee()).toThrow(error);
  });
});
