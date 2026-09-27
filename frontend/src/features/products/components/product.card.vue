<script lang="ts" setup>
import { computed } from 'vue'

import type { Product } from '../../../composables/interfaces/entity/product.entity'

const props = defineProps<{ card: Product }>()

const emit = defineEmits<{ add: [product: Product] }>()

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const formattedPrice = computed(() => currency.format(props.card.price))
const outOfStock = computed(() => props.card.quantity <= 0)
const stockLabel = computed(() => `Quedan ${props.card.quantity}`)
</script>

<template>
  <article class="product-card" :class="{ 'product-card--disabled': outOfStock }">
    <div class="product-image">
      <img :src="card.image" :alt="card.name" loading="lazy" />
      <span class="product-badge" :class="outOfStock ? 'is-out' : 'is-available'">
        {{ outOfStock ? 'Agotado' : stockLabel }}
      </span>
    </div>

    <div class="product-info">
      <h2 class="product-name" :title="card.name">{{ card.name }}</h2>
      <p class="product-price">{{ formattedPrice }}</p>
      <button
        class="product-button"
        type="button"
        :disabled="outOfStock"
        @click="emit('add', card)"
      >
        Agregar
      </button>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    }
  }
}

.product-card--disabled {
  opacity: 0.65;
}

.product-image {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--color-background-mute);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

.product-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  color: #fff;
  border-radius: 999px;

  &.is-available {
    background: rgba(22, 163, 74, 0.92);
  }

  &.is-out {
    background: rgba(220, 38, 38, 0.92);
  }
}

.product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.9rem 1rem 1.1rem;
}

.product-name {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.product-price {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-heading);
}

.product-button {
  margin-top: auto;
  padding: 0.6rem 1rem;
  font: inherit;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: var(--vt-c-indigo);
  border: none;
  border-radius: 10px;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background: #1f2d3a;
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--color-border);
  }
}
</style>
