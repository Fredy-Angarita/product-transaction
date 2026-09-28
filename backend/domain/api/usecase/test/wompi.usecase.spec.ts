import type { CardModel } from '../../../models/card.model';
import type { WompiAcceptableTerms } from '../../../models/wompi.model';
import type { IWompiPaymentPort } from '../../../spi/wompi.payment.port';
import { WompiUseCase } from '../wompi.usecase';

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

const createWompiPayment = (
  overrides: Partial<jest.Mocked<IWompiPaymentPort>> = {},
): jest.Mocked<IWompiPaymentPort> => ({
  getAcceptableTerms: jest.fn(),
  tokenizeCard: jest.fn(),
  generateSign: jest.fn(),
  createWompiTransaction: jest.fn(),
  consultTractionState: jest.fn(),
  ...overrides,
});

describe('WompiUseCase', () => {
  it('returns the acceptable terms from the payment port', async () => {
    const getAcceptableTerms = jest.fn().mockResolvedValue(terms);
    const useCase = new WompiUseCase(
      createWompiPayment({ getAcceptableTerms }),
    );

    await expect(useCase.getAcceptableTerms()).resolves.toEqual(terms);
    expect(getAcceptableTerms).toHaveBeenCalledTimes(1);
  });

  it('delegates card tokenization to the payment port', async () => {
    const tokenizeCard = jest.fn().mockResolvedValue('tok_123');
    const useCase = new WompiUseCase(createWompiPayment({ tokenizeCard }));

    await expect(useCase.tokenizeCard(card)).resolves.toBe('tok_123');
    expect(tokenizeCard).toHaveBeenCalledWith(card);
  });

  it('propagates errors raised by the payment port', async () => {
    const error = new Error('wompi unavailable');
    const useCase = new WompiUseCase(
      createWompiPayment({
        getAcceptableTerms: jest.fn().mockRejectedValue(error),
      }),
    );

    await expect(useCase.getAcceptableTerms()).rejects.toBe(error);
  });
});
