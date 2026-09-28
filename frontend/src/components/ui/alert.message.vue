<script lang="ts" setup>
withDefaults(
  defineProps<{
    variant?: 'error' | 'success' | 'info'
    title?: string
  }>(),
  { variant: 'info', title: '' },
)
</script>

<template>
  <div class="alert-message" :class="`alert-message--${variant}`" role="status">
    <div class="alert-message__body">
      <strong v-if="title" class="alert-message__title">{{ title }}</strong>
      <div class="alert-message__text"><slot /></div>
    </div>
    <div v-if="$slots.actions" class="alert-message__actions"><slot name="actions" /></div>
  </div>
</template>

<style lang="scss" scoped>
.alert-message {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
  border: 1px solid;
  border-radius: 10px;

  &--error {
    color: #991b1b;
    background: #fef2f2;
    border-color: #fecaca;
  }

  &--success {
    color: #14532d;
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  &--info {
    color: #1e3a8a;
    background: #eff6ff;
    border-color: #bfdbfe;
  }
}

.alert-message__title {
  display: block;
  margin-bottom: 0.15rem;
}

.alert-message__text {
  overflow-wrap: anywhere;
}
</style>
