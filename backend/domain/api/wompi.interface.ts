import { CardModel } from '../models/card.model';
import type { WompiAcceptableTerms } from '../models/wompi-acceptable-terms.model';

export const WOMPI_API = Symbol('WOMPI_API');

export interface IWompiApi {
  getAcceptableTerms(): Promise<WompiAcceptableTerms>;
  tokenizePaymentMethod(card: CardModel): Promise<string>;
}
