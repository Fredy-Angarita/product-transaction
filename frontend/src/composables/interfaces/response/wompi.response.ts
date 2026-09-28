export interface WompiAgreementResponse {
  acceptanceToken: string
  permalink: string
  type: string
}

export interface WompiAcceptableTermsResponse {
  presignedAcceptance: WompiAgreementResponse
  presignedPersonalDataAuth: WompiAgreementResponse
}
