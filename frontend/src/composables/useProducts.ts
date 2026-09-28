import { useApi } from './useApi'
import type { ProductListResponse } from './interfaces/response/product.response'

export function useProducts() {
  const api = useApi()

  const fetchProducts = (): Promise<ProductListResponse> =>
    api.get<ProductListResponse>('/api/products')

  return { fetchProducts }
}
