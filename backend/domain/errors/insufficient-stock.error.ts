export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Product ${productId} does not have enough stock: requested ${requested}, available ${available}`,
    );
    this.name = 'InsufficientStockError';
  }
}
