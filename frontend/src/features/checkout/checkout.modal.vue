<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import AppButton from '../../components/ui/app.button.vue'
import AppModal from '../../components/ui/app.modal.vue'
import AppStepper from '../../components/ui/app.stepper.vue'
import type { Product } from '../../composables/interfaces/entity/product.entity'
import { useCheckout } from './composables/useCheckout'
import type { CheckoutStepId } from './checkout.types'
import CustomerStep from './components/steps/customer.step.vue'
import DeliveryStep from './components/steps/delivery.step.vue'
import PaymentStep from './components/steps/payment.step.vue'
import ResultStep from './components/steps/result.step.vue'
import SummaryStep from './components/steps/summary.step.vue'

const props = defineProps<{
  open: boolean
  products: Product[]
}>()

const emit = defineEmits<{
  close: []
  completed: [transaction: { uuid: string; status: string }]
}>()

const checkout = useCheckout()
const {
  step,
  steps,
  stepIndex,
  items,
  customer,
  delivery,
  card,
  consents,
  terms,
  termsLoading,
  termsError,
  feeLoading,
  feeError,
  submitting,
  submitError,
  slowSubmit,
  transaction,
  receipt,
  restoredSession,
  subtotal,
  shipping,
  total,
  isFirstStep,
} = checkout

interface ValidatableStep {
  validate: () => Promise<{ valid: boolean }>
}
const stepRef = ref<ValidatableStep | null>(null)

const isResult = computed(() => step.value === 'result')
const isPayment = computed(() => step.value === 'payment')
const currentStepLabel = computed(() => steps[stepIndex.value]?.label ?? '')

const canPay = computed(
  () => !termsLoading.value && !!terms.value && !termsError.value && total.value > 0,
)

watch(
  () => props.open,
  (open) => {
    if (!open) {
      checkout.reset()
      return
    }

    checkout.setProducts(props.products)
    void checkout.loadTerms()
    void checkout.loadDeliveryFee()
  },
)

function onStepChange(id: string) {
  if (id === 'result' && !transaction.value) return
  checkout.goTo(id as CheckoutStepId)
}

async function onNext() {
  const outcome = await stepRef.value?.validate()
  if (outcome && !outcome.valid) return

  checkout.next()
}

function onBack() {
  checkout.back()
}

async function onSubmit() {
  const outcome = await stepRef.value?.validate()
  if (outcome && !outcome.valid) return

  await checkout.submit()
  if (!transaction.value) return

  const { uuid, status } = transaction.value
  checkout.complete()
  emit('completed', { uuid, status })
}

function onClose() {
  if (submitting.value) return
  emit('close')
}
</script>

<template>
  <AppModal :open="open" size="lg" title="Completar compra" @close="onClose">
    <template #header>
      <div class="checkout-modal__heading">
        <h2 class="checkout-modal__title">Completar compra</h2>
        <p class="checkout-modal__subtitle">
          Paso {{ stepIndex + 1 }} de {{ steps.length }} · {{ currentStepLabel }}
        </p>
      </div>
    </template>

    <AppStepper
      class="checkout-modal__stepper"
      :steps="steps"
      :model-value="step"
      @update:model-value="onStepChange"
    />

    <SummaryStep
      v-if="step === 'summary'"
      :items="items"
      :subtotal="subtotal"
      :shipping="shipping"
      :shipping-loading="feeLoading"
      :shipping-error="feeError"
      :total="total"
      :restored="restoredSession"
      @update-quantity="checkout.setQuantity"
      @dismiss-restored="checkout.dismissRestoredNotice"
    />

    <CustomerStep
      v-else-if="step === 'customer'"
      ref="stepRef"
      :initial-values="customer"
      @update="checkout.patchCustomer"
    />

    <DeliveryStep
      v-else-if="step === 'delivery'"
      ref="stepRef"
      :initial-values="delivery"
      @update="checkout.patchDelivery"
    />

    <PaymentStep
      v-else-if="step === 'payment'"
      ref="stepRef"
      :initial-values="{ ...card, ...consents }"
      :terms="terms"
      :terms-loading="termsLoading"
      :terms-error="termsError"
      :submitting="submitting"
      :slow-submit="slowSubmit"
      :submit-error="submitError"
      :total="total"
      @update="checkout.patchPayment"
      @retry-terms="checkout.loadTerms"
    />

    <ResultStep v-else :transaction="transaction!" :receipt="receipt" />

    <template #footer>
      <template v-if="isResult">
        <AppButton variant="primary" @click="onClose">Cerrar</AppButton>
      </template>
      <template v-else>
        <AppButton variant="secondary" :disabled="isFirstStep" @click="onBack">Atrás</AppButton>

        <AppButton
          v-if="isPayment"
          variant="primary"
          :loading="submitting"
          :disabled="!canPay"
          @click="onSubmit"
        >
          Continuar con tu pago
        </AppButton>
        <AppButton v-else variant="primary" @click="onNext">Continuar</AppButton>
      </template>
    </template>
  </AppModal>
</template>

<style lang="scss" scoped>
.checkout-modal__heading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.checkout-modal__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-heading);
}

.checkout-modal__subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-soft);
}

.checkout-modal__stepper {
  padding-bottom: 1rem;
  margin-bottom: 1.1rem;
  border-bottom: 1px solid var(--color-border);
}
</style>
