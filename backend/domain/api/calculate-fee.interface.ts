export const CALCULATE_FEE_API = Symbol('CALCULATE_FEE_API');

export interface ICalculateFeeApi {
  calculateFee(): number;
}
