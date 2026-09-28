export interface TransactionCardRequest {
  number: string
  cvc: string
  exp_month: string
  exp_year: string
  card_holder: string
}

export interface TransactionCustomerRequest {
  name: string
  lastName: string
  identificationNumber: string
  email: string
}

export interface TransactionDeliveryRequest {
  country: string
  city: string
  locality: string
  subLocality: string
  address: string
  postalCode: string
  additionalInfo: string
}

export interface TransactionItemRequest {
  productId: string
  quantity: number
}

export interface CreateTransactionRequest {
  acceptanceToken: string
  acceptPersonalAuth: string
  customer: TransactionCustomerRequest
  delivery: TransactionDeliveryRequest
  items: TransactionItemRequest[]
  card: TransactionCardRequest
}
