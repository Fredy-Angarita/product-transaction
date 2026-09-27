import type { TransactionStatus } from '../../composables/interfaces/entity/transaction.entity'

export type StatusTone = 'success' | 'error' | 'warning' | 'pending'

const STATUS_LABELS: Record<string, { label: string; tone: StatusTone }> = {
  APPROVED: { label: 'Pago aprobado', tone: 'success' },
  DECLINED: { label: 'Pago rechazado', tone: 'error' },
  VOIDED: { label: 'Pago anulado', tone: 'warning' },
  ERROR: { label: 'Error en el pago', tone: 'error' },
  PENDING: { label: 'Pago en proceso', tone: 'pending' },
}

export function describeTransactionStatus(status: TransactionStatus | string): {
  label: string
  tone: StatusTone
} {
  return STATUS_LABELS[status] ?? { label: status, tone: 'pending' }
}
