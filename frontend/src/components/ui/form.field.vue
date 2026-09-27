<script lang="ts" setup>
import { useId } from 'vue'

defineProps<{
  label: string
  error?: string
  hint?: string
  required?: boolean
}>()

const id = useId()
</script>

<template>
  <div class="form-field" :class="{ 'is-invalid': !!error }">
    <label class="form-field__label" :for="id">
      {{ label }}
      <span v-if="required" class="form-field__required" aria-hidden="true">*</span>
    </label>

    <slot :id="id" :described-by="error ? `${id}-error` : undefined" />

    <p v-if="error" :id="`${id}-error`" class="form-field__error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" class="form-field__hint">{{ hint }}</p>
  </div>
</template>

<style lang="scss" scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.form-field__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-heading);
}

.form-field__required {
  color: #dc2626;
}

.form-field__error {
  margin: 0;
  font-size: 0.75rem;
  color: #dc2626;
}

.form-field__hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-soft);
}

.form-field :deep(input),
.form-field :deep(select),
.form-field :deep(textarea) {
  width: 100%;
  padding: 0.55rem 0.7rem;
  font: inherit;
  color: var(--color-text);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: var(--vt-c-indigo);
    outline: none;
  }
}

.is-invalid :deep(input) {
  border-color: #dc2626;
}
</style>
