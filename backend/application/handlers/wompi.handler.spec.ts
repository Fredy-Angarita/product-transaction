import type { CardModel } from '../../domain/models/card.model';
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

const card: CardModel = {
  number: '4242424242424242',
  cvc: '123',
  exp_month: '08',
  exp_year: '28',
  card_holder: 'Test User',
};

describe('WompiHandler', () => {
  it('delegates the request to the wompi API', async () => {
    const getAcceptableTerms = jest.fn().mockResolvedValue(terms);
    const wompiApi: jest.Mocked<IWompiApi> = {
      getAcceptableTerms,
      tokenizeCard: jest.fn(),
    };
    const handler = new WompiHandler(wompiApi);

    await expect(handler.getAcceptableTerms()).resolves.toEqual(terms);
    expect(getAcceptableTerms).toHaveBeenCalledTimes(1);
  });

  it('delegates card tokenization to the wompi API', async () => {
    const tokenizeCard = jest.fn().mockResolvedValue('tok_123');
    const wompiApi: jest.Mocked<IWompiApi> = {
      getAcceptableTerms: jest.fn(),
      tokenizeCard,
    };
    const handler = new WompiHandler(wompiApi);

    await expect(handler.tokenizeCard(card)).resolves.toBe('tok_123');
    expect(tokenizeCard).toHaveBeenCalledWith(card);
  });

  it('propagates API errors', async () => {
    const error = new Error('api unavailable');
    const wompiApi: jest.Mocked<IWompiApi> = {
      getAcceptableTerms: jest.fn().mockRejectedValue(error),
      tokenizeCard: jest.fn(),
    };
    const handler = new WompiHandler(wompiApi);

    await expect(handler.getAcceptableTerms()).rejects.toBe(error);
  });
});
