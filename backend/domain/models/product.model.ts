export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export type CreateProductInput = Omit<Product, 'id'>;
