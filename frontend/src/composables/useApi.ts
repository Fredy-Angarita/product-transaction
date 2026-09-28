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

export class ApiTimeoutError extends ApiError {
  constructor(
    path: string,
    url: string,
    readonly timeout: number,
    options?: ErrorOptions,
  ) {
    super(`Tiempo de espera agotado (${timeout}ms) en ${path}`, 0, url, undefined, options)
    this.name = 'ApiTimeoutError'
  }
}

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

const DEFAULT_TIMEOUT = 10_000

export interface RequestOptions {
  timeout?: number
}

export function useApi() {
  async function request<T>(
    path: string,
    init: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT,
  ): Promise<T> {
    const url = `${BASE}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    let response: Response
    try {
      response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
      })
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') {
        throw new ApiTimeoutError(path, url, timeout, { cause })
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
    get: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>(path, {}, options?.timeout),
    post: <T>(path: string, body: unknown, options?: RequestOptions): Promise<T> =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }, options?.timeout),
    put: <T>(path: string, body: unknown, options?: RequestOptions): Promise<T> =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, options?.timeout),
    patch: <T>(path: string, body: unknown, options?: RequestOptions): Promise<T> =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, options?.timeout),
    del: <T>(path: string, options?: RequestOptions): Promise<T> =>
      request<T>(path, { method: 'DELETE' }, options?.timeout),
  }
}
