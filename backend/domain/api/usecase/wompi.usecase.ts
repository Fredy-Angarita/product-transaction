import type { CardModel } from '../../models/card.model';
import type {
  NewTransaction,
  NewTransactionRequest,
  PartialTransaction,
  TransactionResponse,
  WompiAcceptableTerms,
} from '../../models/wompi.model';
import type { IWompiPaymentPort } from '../../spi/wompi.payment.port';
import type { IWompiApi } from '../wompi.interface';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class WompiUseCase implements IWompiApi {
  constructor(private readonly wompiPayment: IWompiPaymentPort) {}

  async polling(uuid: string): Promise<TransactionResponse | null> {
    let transaction: TransactionResponse | null = null;
    for (let i = 0; i < 10; i++) {
      transaction = await this.wompiPayment.consultTractionState(uuid);
      if (transaction.data.status !== 'PENDING') {
        return transaction;
      }
      await sleep(1000);
    }
    return transaction;
  }

  async createWompiTransaction(
    transaction: PartialTransaction,
    card: CardModel,
  ): Promise<NewTransaction> {
    const sign = this.wompiPayment.generateSign(
      transaction.reference,
      transaction.amount_in_cents,
    );
    const cardToken = await this.wompiPayment.tokenizeCard(card);
    const payload: NewTransactionRequest = {
      ...transaction,
      signature: sign,
      payment_method: {
        installments: 1,
        token: cardToken,
        type: 'CARD',
      },
    };
    const result = await this.wompiPayment.createWompiTransaction(payload);
    return result;
  }

  getAcceptableTerms(): Promise<WompiAcceptableTerms> {
    return this.wompiPayment.getAcceptableTerms();
  }

  tokenizeCard(card: CardModel): Promise<string> {
    return this.wompiPayment.tokenizeCard(card);
  }
}
