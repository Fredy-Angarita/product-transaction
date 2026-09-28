import { z } from 'zod'

import { SESSION_VERSION } from './checkout.constants'

export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa tu nombre'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos'),
  identificationNumber: z.string().trim().min(3, 'Ingresa tu número de identificación'),
  email: z.email('Ingresa un correo válido'),
})

export const deliverySchema = z.object({
  country: z.string().trim().min(1, 'Ingresa el país'),
  city: z.string().trim().min(1, 'Ingresa la ciudad'),
  locality: z.string().trim().min(1, 'Ingresa la localidad'),
  subLocality: z.string().trim().min(1, 'Ingresa el barrio'),
  address: z.string().trim().min(1, 'Ingresa la dirección'),
  postalCode: z.string().trim().min(1, 'Ingresa el código postal'),
  additionalInfo: z.string().trim().min(1, 'Ingresa una referencia para la entrega'),
})

export const cardSchema = z.object({
  number: z
    .string()
    .transform((value) => value.replace(/\s+/g, ''))
    .pipe(z.string().regex(/^\d{13,19}$/, 'Ingresa un número de tarjeta válido')),
  cvc: z.string().regex(/^\d{3,4}$/, 'El CVC tiene 3 o 4 dígitos'),
  expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Mes inválido (01 - 12)'),
  expYear: z.string().regex(/^\d{2,4}$/, 'Año inválido'),
  cardHolder: z.string().trim().min(1, 'Ingresa el nombre impreso en la tarjeta'),
})

export const paymentSchema = z
  .object({
    ...cardSchema.shape,
    acceptance: z.boolean(),
    personalData: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.acceptance) {
      ctx.addIssue({
        code: 'custom',
        path: ['acceptance'],
        message: 'Debes aceptar los reglamentos y la política de privacidad',
      })
    }
    if (!values.personalData) {
      ctx.addIssue({
        code: 'custom',
        path: ['personalData'],
        message: 'Debes autorizar la administración de datos personales',
      })
    }
  })

export type CheckoutCustomer = z.infer<typeof customerSchema>
export type CheckoutDelivery = z.infer<typeof deliverySchema>
export type CheckoutCard = z.infer<typeof cardSchema>
export type CheckoutPayment = z.infer<typeof paymentSchema>

const optionalText = z.string().trim().optional()

export const sessionSchema = z.object({
  version: z.literal(SESSION_VERSION),
  savedAt: z.string(),
  items: z.array(
    z.object({
      product: z.object({
        id: z.string(),
        name: z.string(),
        image: z.string(),
        price: z.number(),
        quantity: z.number(),
      }),
      quantity: z.number().int().min(1),
    }),
  ),
  customer: z.object({
    name: optionalText,
    lastName: optionalText,
    identificationNumber: optionalText,
    email: optionalText,
  }),
  delivery: z.object({
    country: optionalText,
    city: optionalText,
    locality: optionalText,
    subLocality: optionalText,
    address: optionalText,
    postalCode: optionalText,
    additionalInfo: optionalText,
  }),
})

export type StoredSession = z.infer<typeof sessionSchema>

export function parseSession(raw: string | null): StoredSession | null {
  if (!raw) return null

  try {
    const result = sessionSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : null
  } catch {
    return null
  }
}
