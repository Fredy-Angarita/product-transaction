export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: string | number) {
    super(`${resource} ${id} was not found`);
    this.name = 'ResourceNotFoundError';
  }
}
