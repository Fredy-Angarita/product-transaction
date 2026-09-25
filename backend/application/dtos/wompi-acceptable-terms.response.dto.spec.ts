import type { WompiAcceptableTerms } from '../../domain/models/wompi-acceptable-terms.model';
import { WompiAcceptableTermsResponseDto } from './wompi-acceptable-terms.response.dto';

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

describe('WompiAcceptableTermsResponseDto', () => {
  it('maps both agreements from the domain', () => {
    expect(WompiAcceptableTermsResponseDto.fromDomain(terms)).toEqual(terms);
  });
});
