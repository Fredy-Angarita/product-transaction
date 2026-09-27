<script lang="ts" setup>
import { computed } from 'vue'

import AlertMessage from '../../../../components/ui/alert.message.vue'
import OrderSummary from '../order.summary.vue'
import { maskCardNumber } from '../../card.format'
import { useCurrency } from '../../../../composables/useCurrency'
import type { Transaction } from '../../../../composables/interfaces/entity/transaction.entity'
import type { CheckoutItem, CheckoutReceipt } from '../../checkout.types'
import { describeTransactionStatus } from '../../transaction.status'

const props = defineProps<{
  transaction: Transaction
  /** Copia local: solo aporta el nombre y la imagen, que el backend no devuelve en items. */
  receipt: CheckoutReceipt | null
}>()

const { formatMoney } = useCurrency()

const status = computed(() => describeTransactionStatus(props.transaction.status))

const formattedDate = computed(() => {
  const date = new Date(props.transaction.createdAt)
  return Number.isNaN(date.getTime())
    ? props.transaction.createdAt
    : new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
})

/**
 * Los importes salen del servidor, no del carrito local: `item.price` es lo que se cobró.
 * Del carrito solo se toma el nombre y la imagen, que `saveAll` no carga.
 */
const displayItems = computed<CheckoutItem[]>(() => {
  const local = props.receipt?.items ?? []
  const serverItems = props.transaction.items

  if (serverItems.length === 0) return local

  return serverItems.map((item) => {
    const known = local.find((entry) => entry.product.id === item.productId)?.product
    return {
      product: {
        id: item.productId,
        name: item.product?.name ?? known?.name ?? 'Producto eliminado',
        image: item.product?.image ?? known?.image ?? '',
        price: item.price,
        quantity: item.product?.quantity ?? 0,
      },
      quantity: item.quantity,
    }
  })
})

const subtotal = computed(() =>
  displayItems.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
)

/** La tarifa no viene en el DTO, pero se deduce del total menos los productos. */
const shipping = computed(() => {
  const fee = props.transaction.total - subtotal.value
  return fee > 0 ? Math.round(fee) : null
})

const customer = computed(() => props.transaction.customer)
const delivery = computed(() => props.transaction.delivery)
const maskedCard = computed(() =>
  props.receipt?.card.number ? maskCardNumber(props.receipt.card.number) : '—',
)

const deliveryLabel = computed(() => {
  if (!delivery.value) return '—'
  return [
    `${delivery.value.address}, ${delivery.value.subLocality}, ${delivery.value.locality}`,
    `${delivery.value.city} - ${delivery.value.country}`,
    `CP ${delivery.value.postalCode}`,
    delivery.value.additionalInfo,
  ]
    .filter(Boolean)
    .join(' · ')
})
</script>

<template>
  <div class="result-step">
    <AlertMessage :variant="status.tone === 'success' ? 'success' : 'error'" :title="status.label">
      <p>
        Transacción <strong>{{ transaction.uuid }}</strong> · {{ formattedDate }}
      </p>
    </AlertMessage>

    <OrderSummary
      title="Detalle del pedido"
      :items="displayItems"
      :subtotal="subtotal"
      :shipping="shipping"
      :total="transaction.total"
    />

    <dl class="result-step__data">
      <div class="result-step__row">
        <dt>Comprador</dt>
        <dd v-if="customer">{{ customer.name }} {{ customer.lastName }} · {{ customer.email }}</dd>
        <dd v-else>—</dd>
      </div>
      <div class="result-step__row">
        <dt>Entrega en</dt>
        <dd>{{ deliveryLabel }}</dd>
      </div>
      <div class="result-step__row">
        <dt>Tarjeta</dt>
        <dd>{{ maskedCard }}</dd>
      </div>
      <div class="result-step__row">
        <dt>Estado</dt>
        <dd>{{ transaction.status }}</dd>
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
