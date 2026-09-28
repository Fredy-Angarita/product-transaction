import { useApi } from './useApi'
import type { WompiAcceptableTermsResponse } from './interfaces/response/wompi.response'

export function useWompi() {
  const api = useApi()

  const fetchAcceptableTerms = (): Promise<WompiAcceptableTermsResponse> =>
    api.get<WompiAcceptableTermsResponse>('/api/wompi/acceptable-terms')

  return { fetchAcceptableTerms }
}
