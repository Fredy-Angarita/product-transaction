export interface WompiAgreement {
  acceptanceToken: string;
  permalink: string;
  type: string;
}

export interface WompiAcceptableTerms {
  presignedAcceptance: WompiAgreement;
  presignedPersonalDataAuth: WompiAgreement;
}
