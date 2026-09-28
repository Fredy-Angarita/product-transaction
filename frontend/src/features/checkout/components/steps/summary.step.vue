<script lang="ts" setup>
import AlertMessage from '../../../../components/ui/alert.message.vue'
import OrderSummary from '../order.summary.vue'
import type { CheckoutItem } from '../../checkout.types'

defineProps<{
  items: CheckoutItem[]
  subtotal: number
  shipping: number | null
  total: number
  restored?: boolean
  shippingLoading?: boolean
  shippingError?: string
}>()

const emit = defineEmits<{
  'update-quantity': [productId: string, quantity: number]
  'dismiss-restored': []
}>()
</script>

<template>
  <div class="summary-step">
    <AlertMessage v-if="restored" variant="info" title="Retomamos tu compra">
      Recuperamos los datos que habíasIngressado. Revísalos y continúa desde donde quedaste.
      <template #actions>
        <button class="summary-step__dismiss" type="button" @click="emit('dismiss-restored')">
          Entendido
        </button>
      </template>
    </AlertMessage>

    <OrderSummary
      title="Resumen de la compra"
      :items="items"
      :subtotal="subtotal"
      :shipping="shipping"
      :shipping-loading="shippingLoading"
      :shipping-error="shippingError"
      :total="total"
      editable
      @update-quantity="(productId, quantity) => emit('update-quantity', productId, quantity)"
    >
      <p class="summary-step__note">
        Revisa las unidades antes de continuar. Puedes modificarlas aquí mismo.
      </p>
    </OrderSummary>
  </div>
</template>

<style lang="scss" scoped>
.summary-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-step__note {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-soft);
}

.summary-step__dismiss {
  padding: 0.4rem 0.8rem;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e3a8a;
  cursor: pointer;
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
}
</style>
