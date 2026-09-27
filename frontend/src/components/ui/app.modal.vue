<script lang="ts" setup>
import { onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg'
    closeOnOverlay?: boolean
  }>(),
  {
    title: '',
    size: 'md',
    closeOnOverlay: true,
  },
)

const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div v-if="open" class="app-modal" role="presentation">
        <div class="app-modal__overlay" @click="closeOnOverlay && emit('close')" />

        <div
          class="app-modal__dialog"
          :class="`app-modal__dialog--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title || undefined"
        >
          <header v-if="title || $slots.header" class="app-modal__header">
            <slot name="header">
              <h2 class="app-modal__title">{{ title }}</h2>
            </slot>
            <button
              class="app-modal__close"
              type="button"
              aria-label="Cerrar"
              @click="emit('close')"
            >
              &times;
            </button>
          </header>

          <div class="app-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="app-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.app-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.app-modal__overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
}

.app-modal__dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: min(90vh, 900px);
  overflow: hidden;
  background: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.24);

  &--sm {
    max-width: 420px;
  }

  &--md {
    max-width: 640px;
  }

  &--lg {
    max-width: 880px;
  }
}

.app-modal__header {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid var(--color-border);
}

.app-modal__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-heading);
}

.app-modal__close {
  padding: 0 0.4rem;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-text);
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 8px;

  &:hover {
    background: var(--color-background-mute);
  }
}

.app-modal__body {
  flex: 1;
  padding: 1.4rem;
  overflow-y: auto;
}

.app-modal__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  padding: 1rem 1.4rem;
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.app-modal-enter-active,
.app-modal-leave-active {
  transition: opacity 0.2s ease;
}

.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
}
</style>
