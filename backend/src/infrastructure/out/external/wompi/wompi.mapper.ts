import type {
  WompiAcceptableTerms,
  WompiAgreement,
} from '../../../../../domain/models/wompi-acceptable-terms.model';
import type {
  WompiRawAgreement,
  WompiRawResponse,
} from '../raw/acceptableTerms.raw';

const toDomain = (raw?: WompiRawAgreement): WompiAgreement => ({
  acceptanceToken: raw?.acceptance_token ?? '',
  permalink: raw?.permalink ?? '',
  type: raw?.type ?? '',
});

export class WompiMapper {
  static toDomain(raw: WompiRawResponse): WompiAcceptableTerms {
    return {
      presignedAcceptance: toDomain(raw.data?.presigned_acceptance),
      presignedPersonalDataAuth: toDomain(
        raw.data?.presigned_personal_data_auth,
      ),
    };
  }
}
