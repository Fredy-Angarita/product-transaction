/**
 * El envío NO se calcula en el cliente. `CalculateFeeUseCase` del backend lo decide al crear
 * la transacción, así que antes de pagar solo se conoce la suma de los productos; el total real
 * y la tarifa llegan en la respuesta de `POST /api/transactions`.
 */

export const SESSION_STORAGE_KEY = 'checkout:session'

/** Se incrementa cuando la forma del snapshot guardado cambia, para invalidarlo sin romper el parseo. */
export const SESSION_VERSION = 1
