import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

import { EmptyTransactionItemsError } from '../../../../domain/errors/empty-transaction-items.error';
import { InsufficientStockError } from '../../../../domain/errors/insufficient-stock.error';
import { ResourceNotFoundError } from '../../../../domain/errors/resource-not-found.error';
import { DomainExceptionFilter } from './domain-exception.filter';

const createHost = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
};

describe('DomainExceptionFilter', () => {
  it('maps missing resources to 404', () => {
    const { host, status, json } = createHost();

    new DomainExceptionFilter().catch(
      new ResourceNotFoundError('Product', 'missing'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Product missing was not found',
    });
  });

  it('maps insufficient stock to 409', () => {
    const { host, status, json } = createHost();
    const error = new InsufficientStockError('product-id', 3, 1);

    new DomainExceptionFilter().catch(error, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: error.message,
    });
  });

  it('maps empty transaction items to 400', () => {
    const { host, status, json } = createHost();
    const error = new EmptyTransactionItemsError();

    new DomainExceptionFilter().catch(error, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
    });
  });
});
