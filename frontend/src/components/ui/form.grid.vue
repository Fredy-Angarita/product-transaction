<script lang="ts" setup>
withDefaults(defineProps<{ columns?: 1 | 2 }>(), { columns: 2 })
</script>

<template>
  <div class="form-grid" :class="`form-grid--${columns}`">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.form-grid {
  display: grid;
  gap: 0.9rem;

  &--1 {
    grid-template-columns: 1fr;
  }

  &--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    &--2 {
      grid-template-columns: 1fr;
    }
  }
}

.form-grid > * {
  grid-column: 1 / -1;
}
</style>
