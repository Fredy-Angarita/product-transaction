import { ICalculateFeeApi } from '../calculate-fee.interface';

export class CalculateFeeUseCase implements ICalculateFeeApi {
  calculateFee(): number {
    const max = 50000;
    const min = 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
