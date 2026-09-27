<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import ProductCard from './features/products/components/product.card.vue'
import { useProductsStore } from './stores/products.store'

const store = useProductsStore()
const { products, loading, error } = storeToRefs(store)

onMounted(() => {
  void store.loadProducts()
})
</script>

<template>
  <main class="catalog">
    <p v-if="loading" class="catalog-status">Cargando productos…</p>
    <p v-else-if="error" class="catalog-status catalog-status--error">{{ error }}</p>

    <section v-else class="product-grid">
      <ProductCard v-for="product in products" :key="product.id" :card="product" />
    </section>
  </main>
</template>

<style lang="scss" scoped>
.catalog {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding: clamp(1rem, 3vw, 2rem);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

.catalog-status {
  margin: 0;
  color: var(--color-text);
  text-align: center;
}

.catalog-status--error {
  color: #dc2626;
}
</style>
