import { SeedProductsDto } from './seed-products.dto';

describe('SeedProductsDto', () => {
  it('uses the default number of products', () => {
    expect(new SeedProductsDto().count).toBe(30);
  });
});
