<script lang="ts" setup>
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import AlertMessage from '../../../../components/ui/alert.message.vue'
import FormField from '../../../../components/ui/form.field.vue'
import FormGrid from '../../../../components/ui/form.grid.vue'
import TermsConsent from '../terms.consent.vue'
import { detectBrand, digitsOnly, groupCardNumber } from '../../card.format'
import { useCurrency } from '../../../../composables/useCurrency'
import type { WompiAcceptableTermsResponse } from '../../../../composables/interfaces/response/wompi.response'
import type { CheckoutPayment } from '../../checkout.schemas'
import { paymentSchema, type CheckoutPayment as PaymentValues } from '../../checkout.schemas'

const props = defineProps<{
  initialValues: CheckoutPayment
  terms: WompiAcceptableTermsResponse | null
  termsLoading: boolean
  termsError: string
  submitting: boolean
  slowSubmit: boolean
  submitError: string
  total: number
}>()

const emit = defineEmits<{
  update: [value: CheckoutPayment]
  'retry-terms': []
}>()

const { formatMoney } = useCurrency()

const { errors, defineField, setFieldValue, validate, values } = useForm({
  validationSchema: toTypedSchema<typeof paymentSchema, PaymentValues, PaymentValues>(
    paymentSchema,
  ),
  // Sin validateOnInput: los mensajes salen al salir del campo, no mientras se escribe.
  initialValues: props.initialValues,
})

const [number, numberAttrs] = defineField('number')
const [cardHolder, cardHolderAttrs] = defineField('cardHolder')
const [expMonth, expMonthAttrs] = defineField('expMonth')
const [expYear, expYearAttrs] = defineField('expYear')
const [cvc, cvcAttrs] = defineField('cvc')
const [acceptance] = defineField('acceptance')
const [personalData] = defineField('personalData')

const brand = computed(() => detectBrand(number.value))

/** Agrupa el número en bloques de cuatro mientras se escribe. */
const numberModel = computed({
  get: () => number.value,
  set: (raw: string) => (number.value = groupCardNumber(raw)),
})

/** Solo dígitos, con tope: el input y el esquema piden lo mismo. */
function digitsModel(field: 'cvc' | 'expMonth' | 'expYear', max: number) {
  return computed({
    get: () => values[field],
    set: (raw: string) => setFieldValue(field, digitsOnly(raw).slice(0, max)),
  })
}

const expMonthModel = digitsModel('expMonth', 2)
const expYearModel = digitsModel('expYear', 4)
const cvcModel = digitsModel('cvc', 4)

watch(values, (current) => emit('update', current as CheckoutPayment), { deep: true })

/** El modal valida este paso antes de pagar y usa los valores para armar el body. */
defineExpose({ validate })
</script>

<template>
  <form class="payment-step" novalidate @submit.prevent>
    <h3 class="payment-step__title">Datos de la tarjeta</h3>

    <AlertMessage v-if="submitError" variant="error" title="No pudimos completar el pago">
      <p>{{ submitError }}</p>
    </AlertMessage>

    <FormGrid>
      <FormField
        label="Número de tarjeta"
        required
        :error="errors.number"
        :hint="brand ? `Tarjeta ${brand}` : 'Tarjeta de crédito o débito'"
      >
        <template #default="{ id }">
          <input
            v-model="numberModel"
            v-bind="numberAttrs"
            :id="id"
            type="text"
            inputmode="numeric"
            autocomplete="cc-number"
            placeholder="4242 4242 4242 4242"
          />
        </template>
      </FormField>

      <FormField label="Nombre impreso en la tarjeta" required :error="errors.cardHolder">
        <template #default="{ id }">
          <input
            v-model="cardHolder"
            v-bind="cardHolderAttrs"
            :id="id"
            type="text"
            autocomplete="cc-name"
            placeholder="ANA GÓMEZ"
          />
        </template>
      </FormField>

      <FormField label="Mes de expiración" required :error="errors.expMonth">
        <template #default="{ id }">
          <input
            v-model="expMonthModel"
            v-bind="expMonthAttrs"
            :id="id"
            type="text"
            inputmode="numeric"
            maxlength="2"
            autocomplete="cc-exp-month"
            placeholder="08"
          />
        </template>
      </FormField>

      <FormField label="Año de expiración" required :error="errors.expYear">
        <template #default="{ id }">
          <input
            v-model="expYearModel"
            v-bind="expYearAttrs"
            :id="id"
            type="text"
            inputmode="numeric"
            maxlength="4"
            autocomplete="cc-exp-year"
            placeholder="28"
          />
        </template>
      </FormField>

      <FormField label="CVC" required :error="errors.cvc" hint="3 o 4 dígitos al reverso">
        <template #default="{ id }">
          <input
            v-model="cvcModel"
            v-bind="cvcAttrs"
            :id="id"
            type="password"
            inputmode="numeric"
            maxlength="4"
            autocomplete="cc-csc"
            placeholder="123"
          />
        </template>
      </FormField>
    </FormGrid>

    <TermsConsent
      v-model:acceptance="acceptance"
      v-model:personal-data="personalData"
      :terms="terms"
      :loading="termsLoading"
      :error="termsError"
      :acceptance-error="errors.acceptance"
      :personal-data-error="errors.personalData"
      @retry="emit('retry-terms')"
    />

    <AlertMessage v-if="submitting" variant="info" title="Procesando el pago">
      <span v-if="!slowSubmit">Estamos confirmando tu pago con Wompi…</span>
      <span v-else>
        La respuesta está tardando más de lo normal. La confirmación con el banco puede tardar hasta
        un minuto: no cierres esta ventana.
      </span>
    </AlertMessage>

    <AlertMessage variant="info">
      El pago se procesa de forma segura con Wompi. Nunca almacenamos los datos de tu tarjeta.
    </AlertMessage>

    <p class="payment-step__amount">
      Subtotal de productos: <strong>{{ formatMoney(total) }}</strong>
    </p>
    <p class="payment-step__amount-note">
      La tarifa de envío la calcula el servidor al confirmar el pago y se refleja en el total que se
      cobra.
    </p>
  </form>
</template>

<style lang="scss" scoped>
.payment-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-step__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-heading);
}

.payment-step__amount {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

.payment-step__amount-note {
  margin: -0.5rem 0 0;
  font-size: 0.76rem;
  color: var(--color-text-soft);
}
</style>
