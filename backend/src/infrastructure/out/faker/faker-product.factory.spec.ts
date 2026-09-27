import { FakerProductFactory } from './faker-product.factory';
import { PRODUCT_IMAGE_CATALOG } from './product-image.catalog';

describe('FakerProductFactory', () => {
  const factory = new FakerProductFactory();

  it('creates the requested number of valid products', async () => {
    const products = await factory.create(3);

    expect(products).toHaveLength(3);
    products.forEach((product) => {
      expect(product.id).toEqual(expect.any(String));
      expect(product.name.length).toBeGreaterThan(0);
      expect(product.name.length).toBeLessThanOrEqual(150);
      expect(product.image).toEqual(expect.any(String));
      expect(product.price).toBeGreaterThanOrEqual(5000);
      expect(product.price).toBeLessThanOrEqual(100000);
      expect(product.quantity).toBeGreaterThanOrEqual(1);
      expect(product.quantity).toBeLessThanOrEqual(100);
      expect(
        PRODUCT_IMAGE_CATALOG.some(
          (template) => template.image === product.image,
        ),
      ).toBe(true);
    });
  });

  it('returns an empty list when no products are requested', async () => {
    await expect(factory.create(0)).resolves.toEqual([]);
  });
});
