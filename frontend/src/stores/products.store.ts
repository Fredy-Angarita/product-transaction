import { ref } from 'vue'
import { defineStore } from 'pinia'

import { useProducts } from '../composables/useProducts'
import { ApiError } from '../composables/useApi'
import type { Product } from '../composables/interfaces/entity/product.entity'

export const useProductsStore = defineStore('products', () => {
  const { fetchProducts } = useProducts()

  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadProducts() {
    loading.value = true
    error.value = null

    try {
      products.value = await fetchProducts()
    } catch (cause) {
      products.value = []
      error.value = describeError(cause)
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, loadProducts }
})

function describeError(cause: unknown): string {
  if (cause instanceof ApiError) {
    return cause.status ? `${cause.message} (${cause.status})` : cause.message
  }
  return cause instanceof Error ? cause.message : 'Error desconocido al cargar productos'
}
