import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { EmptyTransactionItemsError } from '../../../../domain/errors/empty-transaction-items.error';
import { InsufficientStockError } from '../../../../domain/errors/insufficient-stock.error';
import { PaymentProviderError } from '../../../../domain/errors/payment-provider.error';
import { ResourceNotFoundError } from '../../../../domain/errors/resource-not-found.error';

type DomainError =
  | ResourceNotFoundError
  | InsufficientStockError
  | EmptyTransactionItemsError
  | PaymentProviderError;

@Catch(
  ResourceNotFoundError,
  InsufficientStockError,
  EmptyTransactionItemsError,
  PaymentProviderError,
)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof PaymentProviderError
        ? exception.httpStatus
        : exception instanceof ResourceNotFoundError
          ? HttpStatus.NOT_FOUND
          : exception instanceof InsufficientStockError
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
