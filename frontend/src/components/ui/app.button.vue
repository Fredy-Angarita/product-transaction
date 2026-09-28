<script lang="ts" setup>
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
    block: false,
  },
)
</script>

<template>
  <button
    class="app-button"
    :class="[`app-button--${variant}`, { 'app-button--block': block, 'is-loading': loading }]"
    :type="type"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="app-button__spinner" aria-hidden="true" />
    <span class="app-button__label"><slot /></span>
  </button>
</template>

<style lang="scss" scoped>
.app-button {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.1rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: var(--vt-c-indigo);
  border: 1px solid transparent;
  border-radius: 10px;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &--secondary {
    color: var(--color-heading);
    background: transparent;
    border-color: var(--color-border);

    &:hover:not(:disabled) {
      background: var(--color-background-mute);
    }
  }

  &--ghost {
    padding-inline: 0.6rem;
    color: var(--color-text);
    background: transparent;

    &:hover:not(:disabled) {
      background: var(--color-background-mute);
    }
  }

  &--block {
    width: 100%;
  }
}

.app-button__spinner {
  width: 0.9em;
  height: 0.9em;
  border: 2px solid currentcolor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: app-button-spin 0.7s linear infinite;
}

@keyframes app-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
