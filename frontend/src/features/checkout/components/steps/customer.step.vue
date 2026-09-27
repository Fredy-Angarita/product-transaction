<script lang="ts" setup>
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import FormField from '../../../../components/ui/form.field.vue'
import FormGrid from '../../../../components/ui/form.grid.vue'
import type { CheckoutCustomer } from '../../checkout.schemas'
import { customerSchema, type CheckoutCustomer as CustomerValues } from '../../checkout.schemas'

const props = defineProps<{ initialValues: CheckoutCustomer }>()

const emit = defineEmits<{ update: [value: CheckoutCustomer] }>()

const { errors, defineField, validate, values } = useForm({
  validationSchema: toTypedSchema<typeof customerSchema, CustomerValues, CustomerValues>(
    customerSchema,
  ),
  // Sin validateOnInput: los mensajes salen al salir del campo, no mientras se escribe.
  initialValues: props.initialValues,
})

const [name, nameAttrs] = defineField('name')
const [lastName, lastNameAttrs] = defineField('lastName')
const [identificationNumber, idAttrs] = defineField('identificationNumber')
const [email, emailAttrs] = defineField('email')

// El formulario es la fuente mientras se edita; el store solo recibe lo que hay que persistir.
watch(values, (current) => emit('update', current as CheckoutCustomer), { deep: true })

defineExpose({ validate })
</script>

<template>
  <form class="customer-step" novalidate @submit.prevent>
    <h3 class="customer-step__title">Datos del cliente</h3>

    <FormGrid>
      <FormField label="Nombre" required :error="errors.name">
        <template #default="{ id }">
          <input
            v-model="name"
            v-bind="nameAttrs"
            :id="id"
            type="text"
            autocomplete="given-name"
            placeholder="Ana"
          />
        </template>
      </FormField>

      <FormField label="Apellidos" required :error="errors.lastName">
        <template #default="{ id }">
          <input
            v-model="lastName"
            v-bind="lastNameAttrs"
            :id="id"
            type="text"
            autocomplete="family-name"
            placeholder="Gómez"
          />
        </template>
      </FormField>

      <FormField label="Número de identificación" required :error="errors.identificationNumber">
        <template #default="{ id }">
          <input
            v-model="identificationNumber"
            v-bind="idAttrs"
            :id="id"
            type="text"
            inputmode="numeric"
            placeholder="123456789"
          />
        </template>
      </FormField>

      <FormField label="Correo electrónico" required :error="errors.email">
        <template #default="{ id }">
          <input
            v-model="email"
            v-bind="emailAttrs"
            :id="id"
            type="email"
            autocomplete="email"
            placeholder="ana@example.com"
          />
        </template>
      </FormField>
    </FormGrid>
  </form>
</template>

<style lang="scss" scoped>
.customer-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.customer-step__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-heading);
}
</style>
