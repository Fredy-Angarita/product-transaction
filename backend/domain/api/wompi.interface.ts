import type { CardModel } from '../models/card.model';
import type {
  NewTransaction,
  PartialTransaction,
  TransactionResponse,
  WompiAcceptableTerms,
} from '../models/wompi.model';

export const WOMPI_API = Symbol('WOMPI_API');

export interface IWompiApi {
  getAcceptableTerms(): Promise<WompiAcceptableTerms>;
  tokenizeCard(card: CardModel): Promise<string>;
  createWompiTransaction(
    transaction: PartialTransaction,
    card: CardModel,
  ): Promise<NewTransaction>;
  polling(uuid: string): Promise<TransactionResponse | null>;
}
