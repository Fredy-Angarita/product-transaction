<script lang="ts" setup>
import { computed } from 'vue'

import AlertMessage from '../../../components/ui/alert.message.vue'
import AppButton from '../../../components/ui/app.button.vue'
import type { WompiAcceptableTermsResponse } from '../../../composables/interfaces/response/wompi.response'
import { safeExternalUrl } from '../../../utils/safe-url'

const props = defineProps<{
  terms: WompiAcceptableTermsResponse | null
  loading: boolean
  error: string
  acceptanceError?: string
  personalDataError?: string
}>()

const acceptance = defineModel<boolean>('acceptance', { required: true })
const personalData = defineModel<boolean>('personalData', { required: true })

const emit = defineEmits<{ retry: [] }>()

const termsUrl = computed(() => safeExternalUrl(props.terms?.presignedAcceptance.permalink))
const personalDataUrl = computed(() =>
  safeExternalUrl(props.terms?.presignedPersonalDataAuth.permalink),
)
</script>

<template>
  <section class="terms-consent" aria-label="Términos de la compra">
    <p v-if="loading" class="terms-consent__loading">Cargando los términos de Wompi…</p>

    <AlertMessage v-else-if="error" variant="error" title="No pudimos cargar los términos">
      <p>{{ error }}</p>
      <template #actions>
        <AppButton variant="secondary" @click="emit('retry')">Reintentar</AppButton>
      </template>
    </AlertMessage>

    <template v-else-if="terms">
      <p class="terms-consent__title">Antes de pagar, acepta los acuerdos de Wompi:</p>

      <div class="terms-consent__items">
        <label class="terms-consent__item" :class="{ 'is-invalid': acceptanceError }">
          <input v-model="acceptance" type="checkbox" />
          <span>
            Acepto haber leído los
            <a
              v-if="termsUrl"
              :href="termsUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              >reglamentos</a
            >
            <template v-else>reglamentos</template>
            y la
            <a
              v-if="termsUrl"
              :href="termsUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              >política de privacidad</a
            >
            <template v-else>política de privacidad</template>
            para hacer este pago.
          </span>
        </label>
        <p v-if="acceptanceError" class="terms-consent__error" role="alert">
          {{ acceptanceError }}
        </p>

        <label class="terms-consent__item" :class="{ 'is-invalid': personalDataError }">
          <input v-model="personalData" type="checkbox" />
          <span>
            Acepto la autorización para la
            <a
              v-if="personalDataUrl"
              :href="personalDataUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              >administración de datos personales</a
            >
            <template v-else>administración de datos personales</template>
          </span>
        </label>
        <p v-if="personalDataError" class="terms-consent__error" role="alert">
          {{ personalDataError }}
        </p>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.terms-consent {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.terms-consent__loading,
.terms-consent__title {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-soft);
}

.terms-consent__title {
  font-weight: 600;
  color: var(--color-heading);
}

.terms-consent__items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.terms-consent__item {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--color-text);
  cursor: pointer;

  input {
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    margin-top: 0.2rem;
    accent-color: var(--vt-c-indigo);
    cursor: pointer;
  }

  a {
    color: var(--vt-c-indigo);
    text-decoration: underline;

    &:hover {
      color: #1f2d3a;
    }
  }
}

.terms-consent__item.is-invalid {
  color: #991b1b;
}

.terms-consent__error {
  margin: -0.2rem 0 0 1.55rem;
  font-size: 0.75rem;
  color: #dc2626;
}
</style>
