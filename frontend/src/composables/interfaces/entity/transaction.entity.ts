/** Espejo de `TransactionResponseDto` del backend. */

export interface TransactionCustomer {
  id: string
  name: string
  lastName: string
  identificationNumber: string
  email: string
}

export interface TransactionDelivery {
  id: string
  country: string
  city: string
  locality: string
  subLocality: string
  address: string
  postalCode: string
  additionalInfo: string
  transactionId: string | null
}

export interface TransactionItem {
  id: string
  transactionId: string
  productId: string
  /** Precio unitario cobrado, congelado en el momento de la compra. */
  price: number
  quantity: number
  /**
   * `saveAll` no carga la relación, así que al crear la transacción llega `null`.
   * El nombre y la imagen se toman del carrito que el usuario ya tenía en pantalla.
   */
  product: TransactionItemProduct | null
}

export interface TransactionItemProduct {
  id: string
  name: string
  image: string
  price: number
  quantity: number
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export interface Transaction {
  uuid: string
  /** Total cobrado: ya incluye la tarifa de envío que decidió el backend. */
  total: number
  customerId: string
  status: TransactionStatus | string
  customer: TransactionCustomer | null
  delivery: TransactionDelivery | null
  items: TransactionItem[]
  createdAt: string
  updatedAt: string
}
