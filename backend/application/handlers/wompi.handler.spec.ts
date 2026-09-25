import type { IWompiApi } from '../../domain/api/wompi.interface';
import type { WompiAcceptableTerms } from '../../domain/models/wompi-acceptable-terms.model';
import { WompiHandler } from './wompi.handler';

const terms: WompiAcceptableTerms = {
  presignedAcceptance: {
    acceptanceToken: 'acceptance-token',
    permalink: 'https://checkout.wompi.co/l/acceptance',
    type: 'signed_acceptance',
  },
  presignedPersonalDataAuth: {
    acceptanceToken: 'personal-data-token',
    permalink: 'https://checkout.wompi.co/l/personal-data',
    type: 'signed_personal_data_auth',
  },
};

describe('WompiHandler', () => {
  it('delegates the request to the wompi API', async () => {
    const getAcceptableTerms = jest.fn().mockResolvedValue(terms);
    const wompiApi: jest.Mocked<IWompiApi> = { getAcceptableTerms };
    const handler = new WompiHandler(wompiApi);

    await expect(handler.getAcceptableTerms()).resolves.toEqual(terms);
    expect(getAcceptableTerms).toHaveBeenCalledTimes(1);
  });

  it('propagates API errors', async () => {
    const error = new Error('api unavailable');
    const wompiApi: jest.Mocked<IWompiApi> = {
      getAcceptableTerms: jest.fn().mockRejectedValue(error),
    };
    const handler = new WompiHandler(wompiApi);

    await expect(handler.getAcceptableTerms()).rejects.toBe(error);
  });
});
