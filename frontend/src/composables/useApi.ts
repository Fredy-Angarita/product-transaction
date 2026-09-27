export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
    readonly body?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ApiError'
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
const TIMEOUT = 10_000

export function useApi() {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${BASE}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)

    let response: Response
    try {
      response = await fetch(url, {
        ...init,
        signal: controller.signal,
        // El header solo se manda si hay body: en los GET evita el preflight de CORS
        headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
      })
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') {
        throw new ApiError(
          `Tiempo de espera agotado (${TIMEOUT}ms) en ${path}`,
          0,
          url,
          undefined,
          {
            cause,
          },
        )
      }
      throw new ApiError(`No se pudo conectar con ${url}`, 0, url, undefined, { cause })
    } finally {
      clearTimeout(timer)
    }

    const text = await response.text()
    const body: unknown = text ? JSON.parse(text) : null

    if (!response.ok) {
      throw new ApiError(`Error ${response.status} en ${path}`, response.status, url, body)
    }

    return body as T
  }

  return {
    get: <T>(path: string): Promise<T> => request<T>(path),
    post: <T>(path: string, body: unknown): Promise<T> =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown): Promise<T> =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown): Promise<T> =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    del: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),
  }
}
