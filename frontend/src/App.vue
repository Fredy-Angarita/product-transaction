<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import ProductCard from './features/products/components/product.card.vue'
import CheckoutModal from './features/checkout/checkout.modal.vue'
import ResumeBanner from './features/checkout/components/resume.banner.vue'
import { useProductsStore } from './stores/products.store'
import { useCheckoutStore } from './stores/checkout.store'
import type { Product } from './composables/interfaces/entity/product.entity'

const store = useProductsStore()
const checkout = useCheckoutStore()
const { products, loading, error } = storeToRefs(store)
const { items, isEmpty } = storeToRefs(checkout)

const checkoutOpen = ref(false)
const selected = ref<Product[]>([])

onMounted(() => {
  void store.loadProducts()
})

// La sesión guardada se revalida contra el catálogo: precios y stock pueden haber cambiado.
watch(products, (list) => {
  if (list.length > 0) checkout.syncWithCatalog(list)
})

function onBuy(product: Product) {
  selected.value = [product]
  checkoutOpen.value = true
}

function onResumeCheckout() {
  selected.value = items.value.map((item) => item.product)
  checkoutOpen.value = true
}

function onDiscardCheckout() {
  checkout.clear()
}

function onCloseCheckout() {
  checkoutOpen.value = false
}

function onCompleted() {
  void store.loadProducts()
}
</script>

<template>
  <main class="catalog">
    <p v-if="loading" class="catalog-status">Cargando productos…</p>
    <p v-else-if="error" class="catalog-status catalog-status--error">{{ error }}</p>

    <template v-else>
      <ResumeBanner
        v-if="!isEmpty"
        :items="items"
        @resume="onResumeCheckout"
        @discard="onDiscardCheckout"
      />

      <section class="product-grid">
        <ProductCard v-for="product in products" :key="product.id" :card="product" @buy="onBuy" />
      </section>
    </template>

    <CheckoutModal
      :open="checkoutOpen"
      :products="selected"
      @close="onCloseCheckout"
      @completed="onCompleted"
    />
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
