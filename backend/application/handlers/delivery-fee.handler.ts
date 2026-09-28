import { Inject, Injectable } from '@nestjs/common';

import { CALCULATE_FEE_API } from '../../domain/api/calculate-fee.interface';
import type { ICalculateFeeApi } from '../../domain/api/calculate-fee.interface';

@Injectable()
export class DeliveryFeeHandler {
  constructor(
    @Inject(CALCULATE_FEE_API)
    private readonly calculateFeeApi: ICalculateFeeApi,
  ) {}

  getDeliveryFee(): number {
    return this.calculateFeeApi.calculateFee();
  }
}
