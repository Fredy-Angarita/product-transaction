/**
 * Solo deja pasar URLs http(s) hacia un `href`. Un `permalink` de la API es entrada
 * externa: sin esta comprobación, un valor `javascript:` terminaría en el atributo `href`.
 *
 * No usa `window.location` como base: los permalinks de Wompi ya son absolutos, y evitar el
 * global mantiene la función usable fuera del navegador.
 */
export function safeExternalUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined

  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}
