import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'crypto';
import type { WompiAcceptableTerms } from '../../../../../domain/models/wompi-acceptable-terms.model';
import type { IWompiPaymentPort } from '../../../../../domain/spi/wompi.payment.port';
import { WompiMapper } from './wompi.mapper';
import type { AcceptableTermsRawResponse } from '../raw/acceptable-terms.raw';
import { TokenizeCardRaw } from '../raw/tokenize-card.raw';
import { CardModel } from '../../../../../domain/models/card.model';

@Injectable()
export class WompiAdapter implements IWompiPaymentPort {
  private readonly publicKey: string;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.publicKey = this.config.get<string>('PUB', '');
  }

  generateSign(reference: string, amount: number): string {
    const amount_in_cents = amount * 100;
    const currency = 'COP';
    const integrityKey = this.config.get<string>('INTEGRITY', '');
    const concat = `${reference}${amount_in_cents}${currency}${integrityKey}`;
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

    return WompiMapper.toDomain(response.data);
  }
}
