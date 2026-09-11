<script setup lang="ts">
import AppTransition from "~/components/AppTransition.vue";

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <AppTransition>
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div
        v-bind="$attrs"
        class="relative flex max-h-[calc(100dvh-0.5rem)] min-h-[160px] w-full min-w-0 flex-col overflow-hidden rounded-t-2xl border border-[var(--bg-main)] bg-[var(--bg-modal)] shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:w-auto sm:min-w-[280px] sm:rounded-2xl"
      >
        <button
          type="button"
          @click="close"
          class="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--btn-bg)] text-lg leading-none transition hover:scale-95 sm:h-9 sm:w-9"
        >
          ×
        </button>

        <div class="flex-1 min-h-0 overflow-hidden">
          <slot />
        </div>
      </div>
    </div>
  </AppTransition>
</template>
