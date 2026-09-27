import { AxiosError, isAxiosError } from 'axios';

import { PaymentProviderError } from '../../../../../domain/errors/payment-provider.error';
import { TransactionStatusEnum } from '../../../../../domain/models/transaction-status.enum';
import type { WompiErrorRaw } from '../raw/wompi-error.raw';

const GATEWAY_TIMEOUT = 504;

const isClientError = (status: number): boolean =>
  status >= 400 && status < 500;

export interface WompiErrorLog {
  message: string;
  context: {
    httpStatus: number;
    transactionStatus: TransactionStatusEnum;
  };
}

export class WompiErrorFactory {
  /**
   * Builds the sanitized log payload. It is derived only from the mapped
   * provider error, never from the request, so card data can never reach it.
   */
  static toLog(operation: string, error: PaymentProviderError): WompiErrorLog {
    return {
      message: `[wompi:${operation}] ${error.message}`,
      context: {
        httpStatus: error.httpStatus,
        transactionStatus: error.transactionStatus,
      },
    };
  }

  static from(error: unknown): PaymentProviderError {
    if (error instanceof PaymentProviderError) {
      return error;
    }

    if (!isAxiosError(error)) {
      return new PaymentProviderError(
        500,
        TransactionStatusEnum.ERROR,
        error instanceof Error ? error.message : 'Unexpected payment error',
      );
    }

    return this.fromAxios(error);
  }

  private static fromAxios(error: AxiosError): PaymentProviderError {
    const response = error.response;

    if (!response) {
      return new PaymentProviderError(
        GATEWAY_TIMEOUT,
        TransactionStatusEnum.ERROR,
        this.extractMessage(error, undefined),
      );
    }

    const raw = response.data as WompiErrorRaw | undefined;
    const httpStatus = response.status;

    return new PaymentProviderError(
      httpStatus,
      isClientError(httpStatus)
        ? TransactionStatusEnum.DECLINED
        : TransactionStatusEnum.ERROR,
      this.extractMessage(error, raw),
    );
  }

  private static extractMessage(
    error: AxiosError,
    raw: WompiErrorRaw | undefined,
  ): string {
    return (
      raw?.error?.message ??
      raw?.error?.reason ??
      raw?.error?.type ??
      error.message
    );
  }
}
