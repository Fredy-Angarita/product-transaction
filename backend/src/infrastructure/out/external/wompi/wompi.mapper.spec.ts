import type { WompiRawResponse } from '../raw/acceptableTerms.raw';
import { WompiMapper } from './wompi.mapper';

describe('WompiMapper', () => {
  it('maps both agreements from the raw response', () => {
    const raw: WompiRawResponse = {
      data: {
        presigned_acceptance: {
          acceptance_token: 'acceptance-token',
          permalink: 'https://checkout.wompi.co/l/acceptance',
          type: 'signed_acceptance',
        },
        presigned_personal_data_auth: {
          acceptance_token: 'personal-data-token',
          permalink: 'https://checkout.wompi.co/l/personal-data',
          type: 'signed_personal_data_auth',
        },
      },
    };

    expect(WompiMapper.toDomain(raw)).toEqual({
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
    });
  });

  it('returns empty agreements when the response has no data', () => {
    expect(WompiMapper.toDomain({})).toEqual({
      presignedAcceptance: { acceptanceToken: '', permalink: '', type: '' },
      presignedPersonalDataAuth: {
        acceptanceToken: '',
        permalink: '',
        type: '',
      },
    });
  });

  it('keeps the agreement that is present and empties the missing one', () => {
    const raw: WompiRawResponse = {
      data: {
        presigned_acceptance: { acceptance_token: 'only-one' },
      },
    };
    const result = WompiMapper.toDomain(raw);

    expect(result.presignedAcceptance.acceptanceToken).toBe('only-one');
    expect(result.presignedPersonalDataAuth).toEqual({
      acceptanceToken: '',
      permalink: '',
      type: '',
    });
  });
});
