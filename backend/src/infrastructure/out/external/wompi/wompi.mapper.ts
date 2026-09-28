import type {
  NewTransaction,
  TransactionResponse,
  WompiAcceptableTerms,
  WompiAgreement,
} from '../../../../../domain/models/wompi.model';
import type {
  WompiRawAgreement,
  AcceptableTermsRawResponse,
} from '../raw/acceptable-terms.raw';
import { NewTransactionRaw } from '../raw/new-transaction.raw';
import { TransactionResponseRaw } from '../raw/transaction-response.raw';

const AcceptToDomain = (raw?: WompiRawAgreement): WompiAgreement => ({
  acceptanceToken: raw?.acceptance_token ?? '',
  permalink: raw?.permalink ?? '',
  type: raw?.type ?? '',
});

const NewTransactionToDomain = (raw: NewTransactionRaw): NewTransaction => ({
  data: {
    id: raw.data.id,
    reference: raw.data.reference,
    created_at: raw.data.created_at,
    amount_in_cents: raw.data.amount_in_cents,
    currency: raw.data.currency,
    customer_email: raw.data.customer_email,
    payment_method_type: raw.data.payment_method_type,
    status: raw.data.status,
  },
});

const TransactionResponseToDomain = (
  raw: TransactionResponseRaw,
): TransactionResponse => ({
  data: {
    id: raw.data.id,
    reference: raw.data.reference,
    status: raw.data.status,
    amount_in_cents: raw.data.amount_in_cents,
    currency: raw.data.currency,
    payment_method_type: raw.data.payment_method_type,
    status_message: raw.data.status_message,
  },
});

export class WompiMapper {
  static AcceptableToDomain(
    raw: AcceptableTermsRawResponse,
  ): WompiAcceptableTerms {
    return {
      presignedAcceptance: AcceptToDomain(raw.data?.presigned_acceptance),
      presignedPersonalDataAuth: AcceptToDomain(
        raw.data?.presigned_personal_data_auth,
      ),
    };
  }

  static NewTransactionToDomain(raw: NewTransactionRaw): NewTransaction {
    return NewTransactionToDomain(raw);
  }

  static TransactionResponseToDomain(
    raw: TransactionResponseRaw,
  ): TransactionResponse {
    return TransactionResponseToDomain(raw);
  }
}
