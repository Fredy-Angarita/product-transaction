import { AxiosError } from 'axios';

import { PaymentProviderError } from '../../../../../domain/errors/payment-provider.error';
import { TransactionStatusEnum } from '../../../../../domain/models/transaction-status.enum';
import { WompiErrorFactory } from './wompi-error';

const withResponse = (status: number, data?: unknown): AxiosError =>
  Object.assign(
    new AxiosError('Request failed with status code', 'ERR_BAD_REQUEST'),
    { response: { status, data } },
  );

const withoutResponse = (code: string): AxiosError =>
  new AxiosError('timeout of 10000ms exceeded', code);

describe('WompiErrorFactory', () => {
  it('returns an already mapped error untouched', () => {
    const error = new PaymentProviderError(
      422,
      TransactionStatusEnum.DECLINED,
      'Card declined',
    );

    expect(WompiErrorFactory.from(error)).toBe(error);
  });

  it('maps a client error to DECLINED and keeps the provider status', () => {
    const error = WompiErrorFactory.from(
      withResponse(422, {
        error: { code: '1', message: 'Card declined' },
      }),
    );

    expect(error).toBeInstanceOf(PaymentProviderError);
    expect(error.httpStatus).toBe(422);
    expect(error.transactionStatus).toBe(TransactionStatusEnum.DECLINED);
    expect(error.message).toBe('Card declined');
  });

  it('maps a server error to ERROR and keeps the provider status', () => {
    const error = WompiErrorFactory.from(
      withResponse(500, { error: { message: 'Internal error' } }),
    );

    expect(error.httpStatus).toBe(500);
    expect(error.transactionStatus).toBe(TransactionStatusEnum.ERROR);
    expect(error.message).toBe('Internal error');
  });

  it('maps a transport failure without response to 504 and ERROR', () => {
    const error = WompiErrorFactory.from(withoutResponse('ECONNABORTED'));

    expect(error.httpStatus).toBe(504);
    expect(error.transactionStatus).toBe(TransactionStatusEnum.ERROR);
    expect(error.message).toBe('timeout of 10000ms exceeded');
  });

  it('falls back to the reason field when message is absent', () => {
    const error = WompiErrorFactory.from(
      withResponse(400, { error: { reason: 'Invalid signature' } }),
    );

    expect(error.message).toBe('Invalid signature');
  });

  it('falls back to the type field when message and reason are absent', () => {
    const error = WompiErrorFactory.from(
      withResponse(401, { error: { type: 'authentication_error' } }),
    );

    expect(error.message).toBe('authentication_error');
  });

  it('falls back to the axios message when the body has no error object', () => {
    const error = WompiErrorFactory.from(
      withResponse(502, '<html>oops</html>'),
    );

    expect(error.httpStatus).toBe(502);
    expect(error.transactionStatus).toBe(TransactionStatusEnum.ERROR);
    expect(error.message).toBe('Request failed with status code');
  });

  it('maps a non axios error to 500 and ERROR', () => {
    const error = WompiErrorFactory.from(
      new TypeError('undefined is not a function'),
    );

    expect(error.httpStatus).toBe(500);
    expect(error.transactionStatus).toBe(TransactionStatusEnum.ERROR);
    expect(error.message).toBe('undefined is not a function');
  });

  it('maps a non object rejection to 500 and ERROR', () => {
    const error = WompiErrorFactory.from('boom');

    expect(error.httpStatus).toBe(500);
    expect(error.transactionStatus).toBe(TransactionStatusEnum.ERROR);
    expect(error.message).toBe('Unexpected payment error');
  });

  describe('toLog', () => {
    it('builds a sanitized log payload from the mapped error', () => {
      const mapped = WompiErrorFactory.from(
        withResponse(422, { error: { message: 'Card declined' } }),
      );

      expect(WompiErrorFactory.toLog('tokenizeCard', mapped)).toEqual({
        message: '[wompi:tokenizeCard] Card declined',
        context: {
          httpStatus: 422,
          transactionStatus: TransactionStatusEnum.DECLINED,
        },
      });
    });

    it('never carries card data even when the axios error holds the request', () => {
      const card = {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '08',
        exp_year: '28',
        card_holder: 'Test User',
      };
      const error = Object.assign(
        new AxiosError('Request failed with status code', 'ERR_BAD_REQUEST'),
        {
          config: { data: JSON.stringify(card) },
          response: {
            status: 422,
            data: { error: { message: 'Card declined' } },
          },
        },
      );

      const mapped = WompiErrorFactory.from(error);
      const serialized = JSON.stringify(
        WompiErrorFactory.toLog('tokenizeCard', mapped),
      );

      expect(Object.keys(mapped)).not.toContain('config');
      expect(serialized).not.toContain(card.number);
      expect(serialized).not.toContain(card.cvc);
      expect(serialized).not.toContain(card.card_holder);
    });
  });
});
