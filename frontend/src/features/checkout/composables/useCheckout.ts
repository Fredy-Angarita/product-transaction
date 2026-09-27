import { computed, getCurrentScope, onScopeDispose, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { ApiError, ApiTimeoutError } from '../../../composables/useApi'
import { useCurrency } from '../../../composables/useCurrency'
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

/** Pasado este tiempo esperando la respuesta del pago, se avisa en vez de dejar un spinner mudo. */
const SLOW_SUBMIT_AFTER_MS = 4_000

/**
 * Orquesta el paso a paso sobre el store de sesión: los datos (producto, cliente, envío)
 * viven en `useCheckoutStore` y sobreviven a una recarga; la tarjeta y el avance del flujo
 * son estado efímero y viven solo en memoria.
 *
 * La validación de cada paso NO vive aquí: la hacen los formularios de vee-validate dentro de
 * los componentes de paso, que exponen su `validate()`. Aquí solo se coordina la navegación,
 * el envío y los términos de Wompi.
 */
export function useCheckout() {
  const store = useCheckoutStore()
  const { createTransaction } = useTransactions()
  const { fetchAcceptableTerms } = useWompi()
  const { formatMoney } = useCurrency()

  const { items, customer, delivery, subtotal, shipping, total, restoredSession, restoredAt } =
    storeToRefs(store)

  const card = reactive<CheckoutCard>(createEmptyCard())
  const consents = reactive<CheckoutConsents>(createEmptyConsents())

  const terms = ref<WompiAcceptableTermsResponse | null>(null)
  const termsLoading = ref(false)
  const termsError = ref('')

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

  // El composable también se puede usar fuera de un componente (pruebas), donde no hay scope.
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

  /**
   * Pide los acuerdos firmados a Wompi. Se llama cada vez que se abre el modal porque los
   * tokens son de vida corta: reutilizar los de una apertura anterior podría fallar al pagar.
   */
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

  /** Cierra el modal: limpia lo efímero y arranca de nuevo en el resumen, sin borrar la sesión. */
  function reset(): void {
    Object.assign(card, createEmptyCard())
    Object.assign(consents, createEmptyConsents())
    step.value = 'summary'
    submitting.value = false
    submitError.value = ''
    transaction.value = null
    receipt.value = null
  }

  /** Compra terminada: la sesión guardada deja de tener sentido, pero el resultado se mantiene en pantalla. */
  function complete(): void {
    store.clear()
  }

  function goTo(next: CheckoutStepId): void {
    step.value = next
  }

  /** El paso activo ya está validado por su formulario antes de llegar aquí. */
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
      // Reutiliza los términos ya cargados al abrir el modal; si no hay, los pide en el acto.
      const agreements = terms.value ?? (await fetchAcceptableTerms())
      const created = await createTransaction({
        acceptanceToken: agreements.presignedAcceptance.acceptanceToken,
        acceptPersonalAuth: agreements.presignedPersonalDataAuth.acceptanceToken,
        customer: { ...customer.value },
        delivery: { ...delivery.value },
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

      // Una 201 sin cuerpo llega como null: sin este chequeo el modal caería en la pantalla
      // de error con el mensaje en blanco.
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
    dismissRestoredNotice: store.dismissRestoredNotice,
  }
}

function describeError(cause: unknown): string {
  // El pago se procesa en el servidor: un timeout NO significa que la compra haya fallado, y
  // reenviarla a ciegas crearía una segunda transacción.
  if (cause instanceof ApiTimeoutError) {
    return 'La confirmación del pago tardó demasiado y cerramos la conexión. La transacción pudo quedar registrada: verifica antes de enviarla de nuevo.'
  }

  if (cause instanceof ApiError) {
    const message = readMessage(cause.body) ?? cause.message
    if (!cause.status) return message
    // Evita "Error 500 en /api/transactions (500)": el status ya suele estar en el mensaje.
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
