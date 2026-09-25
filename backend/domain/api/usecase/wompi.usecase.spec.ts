import type { WompiAcceptableTerms } from '../../models/wompi-acceptable-terms.model';
import type { IWompiPaymentPort } from '../../spi/wompi.payment.port';
import { WompiUseCase } from './wompi.usecase';

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

describe('WompiUseCase', () => {
  it('returns the acceptable terms from the payment port', async () => {
    const getAcceptableTerms = jest.fn().mockResolvedValue(terms);
    const wompiPayment: jest.Mocked<IWompiPaymentPort> = { getAcceptableTerms };
    const useCase = new WompiUseCase(wompiPayment);

    await expect(useCase.getAcceptableTerms()).resolves.toEqual(terms);
    expect(getAcceptableTerms).toHaveBeenCalledTimes(1);
  });

  it('propagates errors raised by the payment port', async () => {
    const error = new Error('wompi unavailable');
    const wompiPayment: jest.Mocked<IWompiPaymentPort> = {
      getAcceptableTerms: jest.fn().mockRejectedValue(error),
    };
    const useCase = new WompiUseCase(wompiPayment);

    await expect(useCase.getAcceptableTerms()).rejects.toBe(error);
  });
});
