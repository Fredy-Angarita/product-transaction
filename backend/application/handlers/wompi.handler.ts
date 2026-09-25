import { Inject, Injectable } from '@nestjs/common';

import { WOMPI_API } from '../../domain/api/wompi.interface';
import type { IWompiApi } from '../../domain/api/wompi.interface';
import type { WompiAcceptableTerms } from '../../domain/models/wompi-acceptable-terms.model';

@Injectable()
export class WompiHandler {
  constructor(
    @Inject(WOMPI_API)
    private readonly wompiApi: IWompiApi,
  ) {}

  getAcceptableTerms(): Promise<WompiAcceptableTerms> {
    return this.wompiApi.getAcceptableTerms();
  }
}
