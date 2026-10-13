<script setup lang="ts">
const props = defineProps<{
  workDays: number
  restDays: number
  active: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    :class="[
      'rounded-full border px-4 py-1 text-sm font-medium transition-colors hover:border-[var(--accent)]',
      props.active
        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
        : 'border-[var(--border-main)] bg-[var(--bg-main)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]',
    ]"
    :aria-pressed="props.active"
    @click="emit('select')"
  >
    {{ props.workDays }}/{{ props.restDays }}
  </button>
</template>
