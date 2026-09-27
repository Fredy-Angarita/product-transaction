import { CalculateFeeUseCase } from '../calculate-fee.usecase';

const MIN_FEE = 1000;
const MAX_FEE = 50000;

describe('CalculateFeeUseCase', () => {
  it('returns an integer fee inside the expected range', () => {
    const useCase = new CalculateFeeUseCase();

    for (let i = 0; i < 1000; i++) {
      const fee = useCase.calculateFee();

      expect(Number.isInteger(fee)).toBe(true);
      expect(fee).toBeGreaterThanOrEqual(MIN_FEE);
      expect(fee).toBeLessThanOrEqual(MAX_FEE);
    }
  });
});
