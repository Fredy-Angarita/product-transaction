<script lang="ts" setup>
import AppButton from '../../../components/ui/app.button.vue'
import type { CheckoutItem } from '../checkout.types'

defineProps<{ items: CheckoutItem[] }>()

const emit = defineEmits<{ resume: []; discard: [] }>()
</script>

<template>
  <aside class="resume-banner" role="status">
    <div class="resume-banner__text">
      <strong class="resume-banner__title">Tienes una compra en curso</strong>
      <span class="resume-banner__detail">
        {{ items.length }} {{ items.length === 1 ? 'producto guardado' : 'productos guardados' }}.
        Retómala donde la dejaste.
      </span>
    </div>

    <div class="resume-banner__actions">
      <AppButton variant="ghost" @click="emit('discard')">Descartar</AppButton>
      <AppButton @click="emit('resume')">Continuar compra</AppButton>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.resume-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  margin-bottom: 1.4rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--vt-c-indigo);
  border-radius: 12px;
}

.resume-banner__text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.resume-banner__title {
  font-size: 0.92rem;
  color: var(--color-heading);
}

.resume-banner__detail {
  font-size: 0.8rem;
  color: var(--color-text-soft);
}

.resume-banner__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
