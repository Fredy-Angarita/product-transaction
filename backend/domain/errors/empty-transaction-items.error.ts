export class EmptyTransactionItemsError extends Error {
  constructor() {
    super('A transaction must contain at least one item');
    this.name = 'EmptyTransactionItemsError';
  }
}
