import { useApi } from './useApi'
import type {
  CreateProductRequest,
  SeedProductsRequest,
} from './interfaces/request/product.request'
import type { Product } from './interfaces/entity/product.entity'
import type {
  ProductListResponse,
  SeedProductsResponse,
} from './interfaces/response/product.response'

export function useProducts() {
  const api = useApi()

  const fetchProducts = (): Promise<ProductListResponse> =>
    api.get<ProductListResponse>('/api/products')

  const createProduct = (body: CreateProductRequest): Promise<Product> =>
    api.post<Product>('/api/products', body)

  const seedProducts = (body: SeedProductsRequest): Promise<SeedProductsResponse> =>
    api.post<SeedProductsResponse>('/api/products/seed', body)

  return { fetchProducts, createProduct, seedProducts }
}
