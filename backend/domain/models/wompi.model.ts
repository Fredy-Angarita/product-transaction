export interface WompiAgreement {
  acceptanceToken: string;
  permalink: string;
  type: string;
}

export interface WompiAcceptableTerms {
  presignedAcceptance: WompiAgreement;
  presignedPersonalDataAuth: WompiAgreement;
}

export interface NewTransaction {
  data: {
    id: string;
    reference: string;
    created_at: string;
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    payment_method_type: string;
    status: string;
  };
}
export interface NewTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  signature: string;
  payment_method_type: string;
  reference: string;
  acceptance_token: string;
}
export type PartialTransaction = Omit<
  NewTransactionRequest,
  'payment_method' | 'signature'
>;

export interface TransactionResponse {
  data: {
    id: string;
    reference: string;
    status: string;
    amount_in_cents: number;
    currency: string;
    payment_method_type: string;
    status_message: string;
  };
}
