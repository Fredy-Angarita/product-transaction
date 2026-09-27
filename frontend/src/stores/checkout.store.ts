import { computed, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import type { Product } from '../composables/interfaces/entity/product.entity'
import { SESSION_STORAGE_KEY, SESSION_VERSION } from '../features/checkout/checkout.constants'
import { parseSession } from '../features/checkout/checkout.schemas'
import {
  createEmptyCustomer,
  createEmptyDelivery,
  type CheckoutItem,
} from '../features/checkout/checkout.types'
import type { CheckoutCustomer, CheckoutDelivery } from '../features/checkout/checkout.schemas'

interface SessionSnapshot {
  version: number
  savedAt: string
  items: CheckoutItem[]
  customer: Partial<CheckoutCustomer>
  delivery: Partial<CheckoutDelivery>
}

export const useCheckoutStore = defineStore('checkout', () => {
  const items = ref<CheckoutItem[]>([])
  const customer = reactive<CheckoutCustomer>(createEmptyCustomer())
  const delivery = reactive<CheckoutDelivery>(createEmptyDelivery())
  const restoredSession = ref(false)
  const restoredAt = ref<string | null>(null)

  const itemCount = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)
  const subtotal = computed(() =>
    items.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  )

  const shipping = ref<number | null>(null)
  const total = computed(() => subtotal.value + (shipping.value ?? 0))

  function hydrate(): void {
    const session = parseSession(readStorage())
    if (!session) return

    items.value = session.items.map((item) => ({
      product: { ...item.product },
      quantity: item.quantity,
    }))
    assignDefined(customer, createEmptyCustomer())
    assignDefined(customer, session.customer)
    assignDefined(delivery, createEmptyDelivery())
    assignDefined(delivery, session.delivery)
    restoredAt.value = session.savedAt
    restoredSession.value = hasContent(toSnapshot())
  }

  function toSnapshot(): SessionSnapshot {
    return {
      version: SESSION_VERSION,
      savedAt: new Date().toISOString(),
      items: items.value,
      customer: stripDefaults(customer, createEmptyCustomer()),
      delivery: stripDefaults(delivery, createEmptyDelivery()),
    }
  }

  function persist(): void {
    if (typeof localStorage === 'undefined') return

    const snapshot = toSnapshot()
    if (!hasContent(snapshot)) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return
    }

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot))
    } catch {}
  }

  function dismissRestoredNotice(): void {
    restoredSession.value = false
  }

  function setProducts(products: Product[]): void {
    items.value = products.map((product) => ({
      product: { ...product },
      quantity: items.value.find((item) => item.product.id === product.id)?.quantity ?? 1,
    }))
  }

  function syncWithCatalog(catalog: Product[]): void {
    if (items.value.length === 0) return

    items.value = items.value.flatMap((item) => {
      const fresh = catalog.find((product) => product.id === item.product.id)
      if (!fresh || fresh.quantity <= 0) return []
      return [{ product: { ...fresh }, quantity: Math.min(item.quantity, fresh.quantity) }]
    })
  }

  function setQuantity(productId: string, quantity: number): void {
    const item = items.value.find((entry) => entry.product.id === productId)
    if (!item) return
    item.quantity = Math.min(Math.max(1, Math.floor(quantity)), item.product.quantity)
  }

  function patchCustomer(patch: Partial<CheckoutCustomer>): void {
    Object.assign(customer, patch)
  }

  function patchDelivery(patch: Partial<CheckoutDelivery>): void {
    Object.assign(delivery, patch)
  }

  function clear(): void {
    items.value = []
    Object.assign(customer, createEmptyCustomer())
    Object.assign(delivery, createEmptyDelivery())
    restoredSession.value = false
    restoredAt.value = null
    persist()
  }

  watch([items, customer, delivery], persist, { deep: true })

  hydrate()

  return {
    items,
    customer,
    delivery,
    restoredSession,
    restoredAt,
    itemCount,
    isEmpty,
    subtotal,
    shipping,
    total,
    hydrate,
    persist,
    dismissRestoredNotice,
    setProducts,
    syncWithCatalog,
    setQuantity,
    patchCustomer,
    patchDelivery,
    clear,
  }
})

function readStorage(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

function hasContent(snapshot: SessionSnapshot): boolean {
  if (snapshot.items.length > 0) return true
  return (
    Object.values(snapshot.customer).some((value) => value !== '') ||
    Object.values(snapshot.delivery).some((value) => value !== '')
  )
}

function stripDefaults<T extends object>(source: T, defaults: T): Partial<T> {
  const from = defaults as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(source)) {
    if (value !== from[key]) result[key] = value
  }

  return result as Partial<T>
}

function assignDefined(target: object, source: object): void {
  const to = target as Record<string, unknown>

  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) to[key] = value
  }
}
