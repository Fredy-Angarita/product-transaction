import type { Product } from '../entity/product.entity'

export type ProductListResponse = Product[]

export type SeedProductsResponse = {
  inserted: number
}
