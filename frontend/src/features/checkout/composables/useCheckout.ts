import { computed, getCurrentScope, onScopeDispose, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { ApiError, ApiTimeoutError } from '../../../composables/useApi'
import { useCurrency } from '../../../composables/useCurrency'
import { useDeliveryFee } from '../../../composables/useDeliveryFee'
import { useTransactions } from '../../../composables/useTransactions'
import { useWompi } from '../../../composables/useWompi'
import type { Transaction } from '../../../composables/interfaces/entity/transaction.entity'
import type { Product } from '../../../composables/interfaces/entity/product.entity'
import type { WompiAcceptableTermsResponse } from '../../../composables/interfaces/response/wompi.response'
import { useCheckoutStore } from '../../../stores/checkout.store'
import type {
  CheckoutCard,
  CheckoutCustomer,
  CheckoutDelivery,
  CheckoutPayment,
} from '../checkout.schemas'
import {
  CHECKOUT_STEPS,
  createEmptyCard,
  createEmptyConsents,
  type CheckoutConsents,
  type CheckoutReceipt,
  type CheckoutStepId,
} from '../checkout.types'

const SLOW_SUBMIT_AFTER_MS = 4_000

export function useCheckout() {
  const store = useCheckoutStore()
  const { createTransaction } = useTransactions()
  const { fetchAcceptableTerms } = useWompi()
  const { fetchDeliveryFee } = useDeliveryFee()
  const { formatMoney } = useCurrency()

  const { items, customer, delivery, subtotal, shipping, total, restoredSession, restoredAt } =
    storeToRefs(store)

  const card = reactive<CheckoutCard>(createEmptyCard())
  const consents = reactive<CheckoutConsents>(createEmptyConsents())

  const terms = ref<WompiAcceptableTermsResponse | null>(null)
  const termsLoading = ref(false)
  const termsError = ref('')

  const feeLoading = ref(false)
  const feeError = ref('')

  const step = ref<CheckoutStepId>('summary')
  const submitting = ref(false)
  const submitError = ref('')
  const slowSubmit = ref(false)
  const transaction = ref<Transaction | null>(null)
  const receipt = ref<CheckoutReceipt | null>(null)

  const stepIndex = computed(() => CHECKOUT_STEPS.findIndex((item) => item.id === step.value))
  const isFirstStep = computed(() => stepIndex.value <= 0)

  let slowTimer: ReturnType<typeof setTimeout> | undefined

  watch(submitting, (busy) => {
    clearTimeout(slowTimer)
    slowSubmit.value = false
    if (!busy) return

    slowTimer = setTimeout(() => {
      slowSubmit.value = true
    }, SLOW_SUBMIT_AFTER_MS)
  })

  if (getCurrentScope()) onScopeDispose(() => clearTimeout(slowTimer))

  function setProducts(products: Product[]): void {
    store.setProducts(products)
  }

  function setQuantity(productId: string, quantity: number): void {
    store.setQuantity(productId, quantity)
  }

  function patchCustomer(patch: Partial<CheckoutCustomer>): void {
    store.patchCustomer(patch)
  }

  function patchDelivery(patch: Partial<CheckoutDelivery>): void {
    store.patchDelivery(patch)
  }

  /** Espejo de los valores del formulario de pago. La tarjeta nunca se persiste. */
  function patchPayment(patch: CheckoutPayment): void {
    Object.assign(card, {
      number: patch.number,
      cvc: patch.cvc,
      expMonth: patch.expMonth,
      expYear: patch.expYear,
      cardHolder: patch.cardHolder,
    })
    Object.assign(consents, {
      acceptance: patch.acceptance,
      personalData: patch.personalData,
    })
  }

  async function loadTerms(): Promise<void> {
    termsLoading.value = true
    termsError.value = ''

    try {
      terms.value = await fetchAcceptableTerms()
    } catch (cause) {
      terms.value = null
      termsError.value = describeError(cause)
    } finally {
      termsLoading.value = false
    }
  }

  /** Cotiza la tarifa una vez y la conserva: es el mismo valor que se cobra. */
  async function loadDeliveryFee(): Promise<void> {
    if (shipping.value !== null) return

    feeLoading.value = true
    feeError.value = ''

    try {
      const { fee } = await fetchDeliveryFee()
      store.setShipping(fee)
    } catch (cause) {
      store.setShipping(0)
      feeError.value = describeError(cause)
    } finally {
      feeLoading.value = false
    }
  }

  function reset(): void {
    Object.assign(card, createEmptyCard())
    Object.assign(consents, createEmptyConsents())
    step.value = 'summary'
    submitting.value = false
    submitError.value = ''
    transaction.value = null
    receipt.value = null
  }

  function complete(): void {
    store.clear()
  }

  function goTo(next: CheckoutStepId): void {
    step.value = next
  }

  function next(): void {
    const target = CHECKOUT_STEPS[stepIndex.value + 1]
    if (target) goTo(target.id)
  }

  function back(): void {
    const target = CHECKOUT_STEPS[stepIndex.value - 1]
    if (target) goTo(target.id)
  }

  async function submit(): Promise<void> {
    if (submitting.value) return

    submitting.value = true
    submitError.value = ''

    try {
      const agreements = terms.value ?? (await fetchAcceptableTerms())
      const created = await createTransaction({
        acceptanceToken: agreements.presignedAcceptance.acceptanceToken,
        acceptPersonalAuth: agreements.presignedPersonalDataAuth.acceptanceToken,
        customer: { ...customer.value },
        delivery: { ...delivery.value, fee: shipping.value ?? 0 },
        items: items.value.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        card: {
          number: card.number.replace(/\s+/g, ''),
          cvc: card.cvc,
          exp_month: card.expMonth,
          exp_year: card.expYear,
          card_holder: card.cardHolder,
        },
      })
      if (!created?.uuid) {
        throw new Error('La API respondió sin los datos de la transacción')
      }

      transaction.value = created
      receipt.value = {
        items: items.value.map((item) => ({
          product: { ...item.product },
          quantity: item.quantity,
        })),
        customer: { ...customer.value },
        delivery: { ...delivery.value },
        card: { ...card },
      }
      step.value = 'result'
    } catch (cause) {
      submitError.value = describeError(cause)
    } finally {
      submitting.value = false
    }
  }

  return {
    steps: CHECKOUT_STEPS,
    step,
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
    restoredAt,
    stepIndex,
    isFirstStep,
    subtotal,
    shipping,
    total,
    formatMoney,
    setProducts,
    setQuantity,
    patchCustomer,
    patchDelivery,
    patchPayment,
    reset,
    complete,
    goTo,
    next,
    back,
    submit,
    loadTerms,
    loadDeliveryFee,
    dismissRestoredNotice: store.dismissRestoredNotice,
  }
}

function describeError(cause: unknown): string {
  if (cause instanceof ApiTimeoutError) {
    return 'La confirmación del pago tardó demasiado y cerramos la conexión. La transacción pudo quedar registrada: verifica antes de enviarla de nuevo.'
  }

  if (cause instanceof ApiError) {
    const message = readMessage(cause.body) ?? cause.message
    if (!cause.status) return message
    return message.includes(String(cause.status)) ? message : `${message} (${cause.status})`
  }
  return cause instanceof Error ? cause.message : 'No se pudo completar la compra'
}

function readMessage(body: unknown): string | null {
  if (typeof body === 'string') return body
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  if (typeof record.message === 'string') return record.message
  if (Array.isArray(record.message) && typeof record.message[0] === 'string')
    return record.message[0]
  return null
}
