import type { CardModel } from '../../models/card.model';
import type { WompiAcceptableTerms } from '../../models/wompi-acceptable-terms.model';
import type { IWompiPaymentPort } from '../../spi/wompi.payment.port';
import type { IWompiApi } from '../wompi.interface';

export class WompiUseCase implements IWompiApi {
  constructor(private readonly wompiPayment: IWompiPaymentPort) {}

  getAcceptableTerms(): Promise<WompiAcceptableTerms> {
    return this.wompiPayment.getAcceptableTerms();
  }

  tokenizeCard(card: CardModel): Promise<string> {
    return this.wompiPayment.tokenizeCard(card);
  }
}
