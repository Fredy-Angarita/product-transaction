<script lang="ts" setup>
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import FormField from '../../../../components/ui/form.field.vue'
import FormGrid from '../../../../components/ui/form.grid.vue'
import type { CheckoutDelivery } from '../../checkout.schemas'
import { deliverySchema, type CheckoutDelivery as DeliveryValues } from '../../checkout.schemas'

const props = defineProps<{ initialValues: CheckoutDelivery }>()

const emit = defineEmits<{ update: [value: CheckoutDelivery] }>()

const { errors, defineField, validate, values } = useForm({
  validationSchema: toTypedSchema<typeof deliverySchema, DeliveryValues, DeliveryValues>(
    deliverySchema,
  ),
  // Sin validateOnInput: los mensajes salen al salir del campo, no mientras se escribe.
  initialValues: props.initialValues,
})

const [country, countryAttrs] = defineField('country')
const [city, cityAttrs] = defineField('city')
const [locality, localityAttrs] = defineField('locality')
const [subLocality, subLocalityAttrs] = defineField('subLocality')
const [address, addressAttrs] = defineField('address')
const [postalCode, postalCodeAttrs] = defineField('postalCode')
const [additionalInfo, additionalInfoAttrs] = defineField('additionalInfo')

watch(values, (current) => emit('update', current as CheckoutDelivery), { deep: true })

defineExpose({ validate })
</script>

<template>
  <form class="delivery-step" novalidate @submit.prevent>
    <h3 class="delivery-step__title">Dirección de entrega</h3>

    <FormGrid>
      <FormField label="País" required :error="errors.country">
        <template #default="{ id }">
          <input
            v-model="country"
            v-bind="countryAttrs"
            :id="id"
            type="text"
            autocomplete="country-name"
          />
        </template>
      </FormField>

      <FormField label="Ciudad" required :error="errors.city">
        <template #default="{ id }">
          <input
            v-model="city"
            v-bind="cityAttrs"
            :id="id"
            type="text"
            autocomplete="address-level2"
            placeholder="Bogotá"
          />
        </template>
      </FormField>

      <FormField label="Localidad" required :error="errors.locality">
        <template #default="{ id }">
          <input
            v-model="locality"
            v-bind="localityAttrs"
            :id="id"
            type="text"
            placeholder="Chapinero"
          />
        </template>
      </FormField>

      <FormField label="Barrio" required :error="errors.subLocality">
        <template #default="{ id }">
          <input
            v-model="subLocality"
            v-bind="subLocalityAttrs"
            :id="id"
            type="text"
            placeholder="Chapinero Alto"
          />
        </template>
      </FormField>

      <FormField label="Dirección" required :error="errors.address">
        <template #default="{ id }">
          <input
            v-model="address"
            v-bind="addressAttrs"
            :id="id"
            type="text"
            autocomplete="street-address"
            placeholder="Calle 100 # 10-20"
          />
        </template>
      </FormField>

      <FormField label="Código postal" required :error="errors.postalCode">
        <template #default="{ id }">
          <input
            v-model="postalCode"
            v-bind="postalCodeAttrs"
            :id="id"
            type="text"
            inputmode="numeric"
            autocomplete="postal-code"
            placeholder="110111"
          />
        </template>
      </FormField>

      <FormField
        label="Referencias del domiciliario"
        required
        :error="errors.additionalInfo"
        hint="Ej.: timbre 4, portón azul, frente al parque"
      >
        <template #default="{ id }">
          <input
            v-model="additionalInfo"
            v-bind="additionalInfoAttrs"
            :id="id"
            type="text"
            placeholder="Apartamento 401"
          />
        </template>
      </FormField>
    </FormGrid>
  </form>
</template>

<style lang="scss" scoped>
.delivery-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delivery-step__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-heading);
}
</style>
