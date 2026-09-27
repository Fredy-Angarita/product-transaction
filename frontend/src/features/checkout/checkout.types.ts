import type { Product } from '../../composables/interfaces/entity/product.entity'
import type { CheckoutCard, CheckoutCustomer, CheckoutDelivery } from './checkout.schemas'

export const CHECKOUT_STEPS = [
  { id: 'summary', label: 'Resumen', description: 'Productos y total' },
  { id: 'customer', label: 'Cliente', description: 'Tus datos' },
  { id: 'delivery', label: 'Envío', description: 'Dirección de entrega' },
  { id: 'payment', label: 'Pago', description: 'Tarjeta de crédito' },
  { id: 'result', label: 'Resultado', description: 'Confirmación' },
] as const

export type CheckoutStepId = (typeof CHECKOUT_STEPS)[number]['id']

export interface CheckoutItem {
  product: Product
  quantity: number
}

/** Los dos acuerdos que hay que aceptar antes de pagar. */
export interface CheckoutConsents {
  /** Reglamentos y política de privacidad. */
  acceptance: boolean
  /** Autorización para la administración de datos personales. */
  personalData: boolean
}

/** Copia congelada de la compra al completarse, para mostrar el resultado aunque se limpie la sesión. */
export interface CheckoutReceipt {
  items: CheckoutItem[]
  customer: CheckoutCustomer
  delivery: CheckoutDelivery
  card: CheckoutCard
}

export function createEmptyCustomer(): CheckoutCustomer {
  return { name: '', lastName: '', identificationNumber: '', email: '' }
}

export function createEmptyDelivery(): CheckoutDelivery {
  return {
    country: 'Colombia',
    city: '',
    locality: '',
    subLocality: '',
    address: '',
    postalCode: '',
    additionalInfo: '',
  }
}

export function createEmptyCard(): CheckoutCard {
  return { number: '', cvc: '', expMonth: '', expYear: '', cardHolder: '' }
}

export function createEmptyConsents(): CheckoutConsents {
  return { acceptance: false, personalData: false }
}
