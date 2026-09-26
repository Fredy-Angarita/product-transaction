import type { CardModel } from '../models/card.model';
import type { WompiAcceptableTerms } from '../models/wompi-acceptable-terms.model';

export const WOMPI_PAYMENT_PORT = Symbol('WOMPI_PAYMENT_PORT');

export interface IWompiPaymentPort {
  getAcceptableTerms(): Promise<WompiAcceptableTerms>;
  tokenizeCard(card: CardModel): Promise<string>;
  generateSign(reference: string, amount: number): string;
}
