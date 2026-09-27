<script lang="ts" setup>
import AppButton from '../../../components/ui/app.button.vue'
import { useCurrency } from '../../../composables/useCurrency'
import type { CheckoutItem } from '../checkout.types'

defineProps<{
  items: CheckoutItem[]
  subtotal: number
  shipping: number
  total: number
  title?: string
  editable?: boolean
}>()

const emit = defineEmits<{ 'update-quantity': [productId: string, quantity: number] }>()

const { formatMoney } = useCurrency()

function decrease(item: CheckoutItem) {
  emit('update-quantity', item.product.id, item.quantity - 1)
}

function increase(item: CheckoutItem) {
  emit('update-quantity', item.product.id, item.quantity + 1)
}
</script>

<template>
  <section class="order-summary">
    <h3 v-if="title" class="order-summary__title">{{ title }}</h3>

    <ul class="order-summary__items">
      <li v-for="item in items" :key="item.product.id" class="order-summary__item">
        <img
          class="order-summary__image"
          :src="item.product.image"
          :alt="item.product.name"
          loading="lazy"
        />

        <div class="order-summary__detail">
          <p class="order-summary__name">{{ item.product.name }}</p>
          <p class="order-summary__unit">Unitario: {{ formatMoney(item.product.price) }}</p>

          <div v-if="editable" class="order-summary__quantity">
            <AppButton
              variant="secondary"
              :disabled="item.quantity <= 1"
              :aria-label="`Quitar una unidad de ${item.product.name}`"
              @click="decrease(item)"
            >
              −
            </AppButton>
            <span class="order-summary__quantity-value">{{ item.quantity }}</span>
            <AppButton
              variant="secondary"
              :disabled="item.quantity >= item.product.quantity"
              :aria-label="`Agregar una unidad de ${item.product.name}`"
              @click="increase(item)"
            >
              +
            </AppButton>
          </div>
        </div>

        <p class="order-summary__amount">{{ formatMoney(item.product.price * item.quantity) }}</p>
      </li>
    </ul>

    <dl class="order-summary__totals">
      <div class="order-summary__row">
        <dt>Subtotal</dt>
        <dd>{{ formatMoney(subtotal) }}</dd>
      </div>
      <div class="order-summary__row">
        <dt>Envío</dt>
        <dd>{{ formatMoney(shipping) }}</dd>
      </div>
      <div class="order-summary__row order-summary__row--total">
        <dt>Total</dt>
        <dd>{{ formatMoney(total) }}</dd>
      </div>
    </dl>

    <slot />
  </section>
</template>

<style lang="scss" scoped>
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.order-summary__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-heading);
}

.order-summary__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.order-summary__item {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  padding: 0.7rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.order-summary__image {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 10px;
}

.order-summary__detail {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.order-summary__name {
  margin: 0;
  overflow: hidden;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-heading);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-summary__unit {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-soft);
}

.order-summary__quantity {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin-top: 0.3rem;

  :deep(.app-button) {
    width: 2rem;
    padding: 0.2rem 0;
  }
}

.order-summary__quantity-value {
  min-width: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.order-summary__amount {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-heading);
  white-space: nowrap;
}

.order-summary__totals {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.6rem;
  margin: 0;
  border-top: 1px solid var(--color-border);
}

.order-summary__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text);

  dd {
    margin: 0;
    font-weight: 600;
  }
}

.order-summary__row--total {
  padding-top: 0.35rem;
  margin-top: 0.2rem;
  font-size: 1rem;
  border-top: 1px dashed var(--color-border);

  dt,
  dd {
    font-weight: 700;
    color: var(--color-heading);
  }
}
</style>
