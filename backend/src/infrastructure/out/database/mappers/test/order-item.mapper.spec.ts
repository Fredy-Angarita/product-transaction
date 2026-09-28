import { OrderItemEntity } from '../../entity/order.item.entity';
import { ProductEntity } from '../../entity/product.entity';
import { OrderItemMapper } from '../order-item.mapper';

const product = {
  id: 'product-id',
  name: 'Product',
  image: 'https://example.com/product.png',
  price: 19.99,
  quantity: 4,
} as unknown as ProductEntity;

const orderItem = {
  id: 'item-id',
  transactionId: 'transaction-id',
  productId: product.id,
  price: '19.99',
  quantity: 2,
  product,
} as unknown as OrderItemEntity;

describe('OrderItemMapper', () => {
  it('maps an order item and its product', () => {
    expect(OrderItemMapper.toDomain(orderItem)).toEqual({
      id: 'item-id',
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
      product: {
        id: 'product-id',
        name: 'Product',
        image: 'https://example.com/product.png',
        price: 19.99,
        quantity: 4,
      },
    });
  });

  it('maps an order item without a loaded product', () => {
    const entity = {
      ...orderItem,
      product: null,
    } as unknown as OrderItemEntity;

    expect(OrderItemMapper.toDomain(entity).product).toBeNull();
  });

  it('maps order item input to an entity', () => {
    const input = {
      transactionId: 'transaction-id',
      productId: 'product-id',
      price: 19.99,
      quantity: 2,
    };

    expect(OrderItemMapper.toEntity(input)).toEqual(
      expect.objectContaining(input),
    );
  });
});
