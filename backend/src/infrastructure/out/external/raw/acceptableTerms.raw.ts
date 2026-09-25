export interface WompiRawAgreement {
  acceptance_token?: string;
  permalink?: string;
  type?: string;
}

export interface WompiRawResponse {
  data?: {
    presigned_acceptance?: WompiRawAgreement;
    presigned_personal_data_auth?: WompiRawAgreement;
  };
}
