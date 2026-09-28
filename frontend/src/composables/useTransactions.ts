import { useApi } from './useApi'
import type { Transaction } from './interfaces/entity/transaction.entity'
import type { CreateTransactionRequest } from './interfaces/request/transaction.request'
import type { TransactionListResponse } from './interfaces/response/transaction.response'

export function useTransactions() {
  const api = useApi()

  const fetchTransactions = (): Promise<TransactionListResponse> =>
    api.get<TransactionListResponse>('/api/transactions')

  const createTransaction = (body: CreateTransactionRequest): Promise<Transaction> =>
    api.post<Transaction>('/api/transactions', body, { timeout: 30_000 })

  return { fetchTransactions, createTransaction }
}
