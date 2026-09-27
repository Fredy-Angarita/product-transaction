export interface CreateProductRequest {
  name: string
  image: string
  price: number
  quantity: number
}

export interface SeedProductsRequest {
  count: number
}
