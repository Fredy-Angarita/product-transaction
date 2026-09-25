import type { WompiAcceptableTerms } from '../../../../domain/models/wompi-acceptable-terms.model';
import { WompiHandler } from '../../../../application/handlers/wompi.handler';
import { WompiController } from './wompi.controller';

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

describe('WompiController', () => {
  it('returns the acceptable terms exposed by the handler', async () => {
    const handler = {
      getAcceptableTerms: jest.fn().mockResolvedValue(terms),
    } as unknown as WompiHandler;
    const controller = new WompiController(handler);

    await expect(controller.getAcceptableTerms()).resolves.toEqual(terms);
  });

  it('propagates handler errors', async () => {
    const error = new Error('handler unavailable');
    const handler = {
      getAcceptableTerms: jest.fn().mockRejectedValue(error),
    } as unknown as WompiHandler;
    const controller = new WompiController(handler);

    await expect(controller.getAcceptableTerms()).rejects.toBe(error);
  });
});
