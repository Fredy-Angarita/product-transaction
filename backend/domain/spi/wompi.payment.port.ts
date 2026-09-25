import type { WompiAcceptableTerms } from '../models/wompi-acceptable-terms.model';

export const WOMPI_PAYMENT_PORT = Symbol('WOMPI_PAYMENT_PORT');

export interface IWompiPaymentPort {
  getAcceptableTerms(): Promise<WompiAcceptableTerms>;
  tokenizeCard(): Promise<string>;
}
