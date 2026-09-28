<script lang="ts" setup>
export interface AppStep {
  id: string
  label: string
  description?: string
}

const props = defineProps<{
  steps: readonly AppStep[]
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [id: string] }>()

function indexOf(id: string): number {
  return props.steps.findIndex((step) => step.id === id)
}

function statusOf(index: number): 'done' | 'current' | 'pending' {
  const current = indexOf(props.modelValue)
  if (index < current) return 'done'
  if (index === current) return 'current'
  return 'pending'
}

function isReachable(index: number): boolean {
  return index <= indexOf(props.modelValue)
}
</script>

<template>
  <nav class="app-stepper" aria-label="Progreso de la compra">
    <ol class="app-stepper__list">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="app-stepper__item"
        :class="`is-${statusOf(index)}`"
      >
        <button
          class="app-stepper__button"
          type="button"
          :disabled="!isReachable(index)"
          :aria-current="statusOf(index) === 'current' ? 'step' : undefined"
          @click="emit('update:modelValue', step.id)"
        >
          <span class="app-stepper__marker">
            <template v-if="statusOf(index) === 'done'">✓</template>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="app-stepper__text">
            <span class="app-stepper__label">{{ step.label }}</span>
            <small v-if="step.description" class="app-stepper__description">{{
              step.description
            }}</small>
          </span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.app-stepper__list {
  display: flex;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  overflow-x: auto;
  list-style: none;
}

.app-stepper__item {
  flex: 1;
  min-width: 8.5rem;
}

.app-stepper__button {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: none;
  border: 1px solid transparent;
  border-radius: 10px;
  transition: background-color 0.2s ease;

  &:disabled {
    cursor: default;
  }

  &:hover:not(:disabled) {
    background: var(--color-background-mute);
  }
}

.app-stepper__marker {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text);
  background: var(--color-background-mute);
  border-radius: 50%;
}

.app-stepper__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-stepper__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.app-stepper__description {
  overflow: hidden;
  font-size: 0.72rem;
  color: var(--color-text-soft);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-current {
  .app-stepper__button {
    background: var(--color-background-soft);
    border-color: var(--color-border);
  }

  .app-stepper__marker {
    color: #fff;
    background: var(--vt-c-indigo);
  }

  .app-stepper__label {
    color: var(--color-heading);
  }
}

.is-done .app-stepper__marker {
  color: #fff;
  background: #16a34a;
}
</style>
