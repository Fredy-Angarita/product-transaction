import type { ICalculateFeeApi } from '../../domain/api/calculate-fee.interface';
import { DeliveryFeeHandler } from './delivery-fee.handler';

const createCalculateFeeApi = (
  overrides: Partial<jest.Mocked<ICalculateFeeApi>> = {},
): jest.Mocked<ICalculateFeeApi> => ({
  calculateFee: jest.fn().mockReturnValue(15000),
  ...overrides,
});

describe('DeliveryFeeHandler', () => {
  it('returns the fee calculated by the domain', () => {
    const handler = new DeliveryFeeHandler(createCalculateFeeApi());

    expect(handler.getDeliveryFee()).toBe(15000);
  });

  it('asks the domain for a new quote on every call', () => {
    const calculateFee = jest
      .fn()
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(50000);
    const handler = new DeliveryFeeHandler(
      createCalculateFeeApi({ calculateFee }),
    );

    expect(handler.getDeliveryFee()).toBe(1000);
    expect(handler.getDeliveryFee()).toBe(50000);
    expect(calculateFee).toHaveBeenCalledTimes(2);
  });

  it('propagates errors thrown while quoting', () => {
    const error = new Error('fee unavailable');
    const handler = new DeliveryFeeHandler(
      createCalculateFeeApi({
        calculateFee: jest.fn(() => {
          throw error;
        }),
      }),
    );

    expect(() => handler.getDeliveryFee()).toThrow(error);
  });
});
