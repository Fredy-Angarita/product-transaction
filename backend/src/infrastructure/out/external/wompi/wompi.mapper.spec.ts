import type { AcceptableTermsRawResponse } from '../raw/acceptable-terms.raw';
import type { NewTransactionRaw } from '../raw/new-transaction.raw';
import type { TransactionResponseRaw } from '../raw/transaction-response.raw';
import { WompiMapper } from './wompi.mapper';

describe('WompiMapper', () => {
  it('maps both agreements from the raw response', () => {
    const raw: AcceptableTermsRawResponse = {
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

    expect(WompiMapper.AcceptableToDomain(raw)).toEqual({
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
    expect(WompiMapper.AcceptableToDomain({})).toEqual({
      presignedAcceptance: { acceptanceToken: '', permalink: '', type: '' },
      presignedPersonalDataAuth: {
        acceptanceToken: '',
        permalink: '',
        type: '',
      },
    });
  });

  it('keeps the agreement that is present and empties the missing one', () => {
    const raw: AcceptableTermsRawResponse = {
      data: {
        presigned_acceptance: { acceptance_token: 'only-one' },
      },
    };
    const result = WompiMapper.AcceptableToDomain(raw);

    expect(result.presignedAcceptance.acceptanceToken).toBe('only-one');
    expect(result.presignedPersonalDataAuth).toEqual({
      acceptanceToken: '',
      permalink: '',
      type: '',
    });
  });

  it('maps a new transaction raw response to domain', () => {
    const raw: NewTransactionRaw = {
      data: {
        id: 'txn-123',
        reference: 'PAY-2026-0001',
        created_at: '2026-09-25T10:00:00.000Z',
        amount_in_cents: 399800,
        currency: 'COP',
        customer_email: 'ana@example.com',
        payment_method_type: 'CARD',
        status: 'PENDING',
      },
    };

    expect(WompiMapper.NewTransactionToDomain(raw)).toEqual({
      data: {
        id: 'txn-123',
        reference: 'PAY-2026-0001',
        created_at: '2026-09-25T10:00:00.000Z',
        amount_in_cents: 399800,
        currency: 'COP',
        customer_email: 'ana@example.com',
        payment_method_type: 'CARD',
        status: 'PENDING',
      },
    });
  });

  it('maps a transaction response raw to domain', () => {
    const raw: TransactionResponseRaw = {
      data: {
        id: 'txn-123',
        reference: 'PAY-2026-0001',
        status: 'APPROVED',
        amount_in_cents: 399800,
        currency: 'COP',
        payment_method_type: 'CARD',
        status_message: 'Transaction approved',
      },
    };

    expect(WompiMapper.TransactionResponseToDomain(raw)).toEqual({
      data: {
        id: 'txn-123',
        reference: 'PAY-2026-0001',
        status: 'APPROVED',
        amount_in_cents: 399800,
        currency: 'COP',
        payment_method_type: 'CARD',
        status_message: 'Transaction approved',
      },
    });
  });
});
