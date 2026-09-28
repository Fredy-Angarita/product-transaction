import { useApi } from './useApi'
import type { DeliveryFeeResponse } from './interfaces/response/delivery-fee.response'

export function useDeliveryFee() {
  const api = useApi()

  const fetchDeliveryFee = (): Promise<DeliveryFeeResponse> =>
    api.get<DeliveryFeeResponse>('/api/delivery-fee')

  return { fetchDeliveryFee }
}
