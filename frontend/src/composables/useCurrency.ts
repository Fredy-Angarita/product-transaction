const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function useCurrency() {
  function formatMoney(value: number): string {
    return formatter.format(Number.isFinite(value) ? value : 0)
  }

  return { formatMoney }
}
