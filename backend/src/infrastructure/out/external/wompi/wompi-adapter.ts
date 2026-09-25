import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import type { WompiAcceptableTerms } from '../../../../../domain/models/wompi-acceptable-terms.model';
import type { IWompiPaymentPort } from '../../../../../domain/spi/wompi.payment.port';
import { WompiMapper } from './wompi.mapper';
import type { WompiRawResponse } from '../raw/acceptableTerms.raw';

@Injectable()
export class WompiAdapter implements IWompiPaymentPort {
  private readonly publicKey: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.publicKey = config.get<string>('PUB', '');
  }
  tokenizeCard(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async getAcceptableTerms(): Promise<WompiAcceptableTerms> {
    const response = await firstValueFrom(
      this.http.get<WompiRawResponse>('/merchants/info', {
        headers: { 'x-merchant-public-key': this.publicKey },
      }),
    );

    return WompiMapper.toDomain(response.data);
  }
}
