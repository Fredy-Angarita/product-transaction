import { useApi } from './useApi'
import type { Transaction } from './interfaces/entity/transaction.entity'
import type { CreateTransactionRequest } from './interfaces/request/transaction.request'
import type { TransactionListResponse } from './interfaces/response/transaction.response'

export function useTransactions() {
  const api = useApi()

  const fetchTransactions = (): Promise<TransactionListResponse> =>
    api.get<TransactionListResponse>('/api/transactions')

  // Timeout de 30s: antes de responder, la API tokeniza la tarjeta, crea la transacción en
  // Wompi y sondea su estado hasta 5 veces esperando 1s entre cada intento. Con los 10s
  // por defecto el navegador abortaba antes de que el servidor terminara.
  const createTransaction = (body: CreateTransactionRequest): Promise<Transaction> =>
    api.post<Transaction>('/api/transactions', body, { timeout: 30_000 })

  return { fetchTransactions, createTransaction }
}
