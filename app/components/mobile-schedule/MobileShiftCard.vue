<script setup lang="ts">
import type { ShiftWithRelations } from '~~/types/shift'

const props = withDefaults(defineProps<{
  shift: ShiftWithRelations
  isManager: boolean
  employeeOrder?: 'surname-first' | 'name-first'
}>(), {
  employeeOrder: 'surname-first',
})

defineEmits<{ (e: 'delete', shiftId: string): void }>()

const employeeLabel = computed(() => props.employeeOrder === 'name-first'
  ? `${props.shift.employee.name} ${props.shift.employee.surname}`
  : `${props.shift.employee.surname} ${props.shift.employee.name}`)

const shiftGradient = computed(() =>
  `linear-gradient(135deg, ${props.shift.position.color} 0%, ${props.shift.employee.color} 100%)`)
</script>

<template>
  <article
    class="flex min-h-16 items-center gap-3 rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] px-3 py-3"
  >
    <span class="w-2 shrink-0 self-stretch rounded-full" :style="{ background: shiftGradient }" aria-hidden="true" />
    <div class="min-w-0 flex-1">
      <p class="m-0 truncate font-bold">{{ shift.position.name }}</p>
      <p class="mt-1 truncate text-sm text-[var(--text-soft)]">{{ employeeLabel }}</p>
    </div>
    <button
      v-if="isManager"
      type="button"
      class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-[var(--btn-delete-text)] transition duration-100 active:scale-95"
      :aria-label="$t('btn.delete')"
      :title="$t('btn.delete')"
      @click="$emit('delete', shift.id)"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </article>
</template>
