import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';
import type {
  NewTransaction,
  NewTransactionRequest,
  TransactionResponse,
  WompiAcceptableTerms,
} from '../../../../../domain/models/wompi.model';
import type { IWompiPaymentPort } from '../../../../../domain/spi/wompi.payment.port';
import { WompiMapper } from './wompi.mapper';
import type { AcceptableTermsRawResponse } from '../raw/acceptable-terms.raw';
import { NewTransactionRaw } from '../raw/new-transaction.raw';
import { TokenizeCardRaw } from '../raw/tokenize-card.raw';
import { TransactionResponseRaw } from '../raw/transaction-response.raw';
import { CardModel } from '../../../../../domain/models/card.model';

@Injectable()
export class WompiAdapter implements IWompiPaymentPort {
  private readonly publicKey: string;
  private readonly privKey: string;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.publicKey = this.config.get<string>('PUB', '');
    this.privKey = this.config.get<string>('PVR', '');
  }

  generateSign(reference: string, amount: number): string {
    const currency = 'COP';
    const integrityKey = this.config.get<string>('INTEGRITY', '');
    const concat = `${reference}${amount}${currency}${integrityKey}`;
    return createHash('sha256').update(concat).digest('hex');
  }

  async tokenizeCard(card: CardModel): Promise<string> {
    const response = await firstValueFrom(
      this.http.post<TokenizeCardRaw>('/tokens/cards', card, {
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/json',
        },
      }),
    );
    return response.data.data.id;
  }

  async getAcceptableTerms(): Promise<WompiAcceptableTerms> {
    const response = await firstValueFrom(
      this.http.get<AcceptableTermsRawResponse>('/merchants/info', {
        headers: { 'x-merchant-public-key': this.publicKey },
      }),
    );

    return WompiMapper.AcceptableToDomain(response.data);
  }

  async createWompiTransaction(
    transaction: NewTransactionRequest,
  ): Promise<NewTransaction> {
    const response = await firstValueFrom(
      this.http.post<NewTransactionRaw>('/transactions', transaction, {
        headers: {
          Authorization: `Bearer ${this.privKey}`,
          'Content-Type': 'application/json',
        },
      }),
    );
    return WompiMapper.NewTransactionToDomain(response.data);
  }

  async consultTractionState(id: string): Promise<TransactionResponse> {
    const response = await firstValueFrom(
      this.http.get<TransactionResponseRaw>(`/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${this.privKey}`,
          'Content-Type': 'application/json',
        },
      }),
    );
    return WompiMapper.TransactionResponseToDomain(response.data);
  }
}
