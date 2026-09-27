<script lang="ts" setup>
import { computed } from 'vue'

import AlertMessage from '../../../../components/ui/alert.message.vue'
import OrderSummary from '../order.summary.vue'
import { maskCardNumber } from '../../card.format'
import { SHIPPING_FLAT_RATE } from '../../checkout.constants'
import { useCurrency } from '../../../../composables/useCurrency'
import type { Transaction } from '../../../../composables/interfaces/entity/transaction.entity'
import type { CheckoutReceipt } from '../../checkout.types'

const props = defineProps<{
  transaction: Transaction
  receipt: CheckoutReceipt | null
}>()

const { formatMoney } = useCurrency()

const items = computed(() => props.receipt?.items ?? [])

const subtotal = computed(() =>
  items.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
)
const shipping = computed(() => (items.value.length > 0 ? SHIPPING_FLAT_RATE : 0))
const total = computed(() => props.transaction?.total ?? subtotal.value + shipping.value)

const formattedDate = computed(() => {
  if (!props.transaction) return ''
  const date = new Date(props.transaction.createdAt)
  return Number.isNaN(date.getTime())
    ? props.transaction.createdAt
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
})

const deliveryLabel = computed(() => {
  const delivery = props.receipt?.delivery
  if (!delivery) return ''
  return [
    `${delivery.address}, ${delivery.subLocality}, ${delivery.locality}`,
    `${delivery.city} - ${delivery.country}`,
    `CP ${delivery.postalCode}`,
    delivery.additionalInfo,
  ]
    .filter(Boolean)
    .join(' · ')
})
</script>

<template>
  <div class="result-step">
    <AlertMessage variant="success" title="¡Compra realizada con éxito!">
      <p>
        Transacción <strong>{{ transaction.uuid }}</strong> · Estado {{ transaction.status }} ·
        {{ formattedDate }}
      </p>
    </AlertMessage>

    <OrderSummary
      v-if="items.length > 0"
      title="Detalle del pedido"
      :items="items"
      :subtotal="subtotal"
      :shipping="shipping"
      :total="total"
    />

    <dl v-if="receipt" class="result-step__data">
      <div class="result-step__row">
        <dt>Comprador</dt>
        <dd>
          {{ receipt.customer.name }} {{ receipt.customer.lastName }} ·
          {{ receipt.customer.email }}
        </dd>
      </div>
      <div class="result-step__row">
        <dt>Entrega en</dt>
        <dd>{{ deliveryLabel }}</dd>
      </div>
      <div class="result-step__row">
        <dt>Tarjeta</dt>
        <dd>{{ maskCardNumber(receipt.card.number) }}</dd>
      </div>
    </dl>
  </div>
</template>

<style lang="scss" scoped>
.result-step {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.result-step__data {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.8rem 0.9rem;
  margin: 0;
  background: var(--color-background-soft);
  border-radius: 12px;
}

.result-step__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.82rem;

  dt {
    font-weight: 700;
    color: var(--color-heading);
  }

  dd {
    margin: 0;
    color: var(--color-text);
  }
}
</style>
