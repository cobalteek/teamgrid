<script setup lang="ts">
import MobileShiftCard from './MobileShiftCard.vue'
import type { ShiftWithRelations } from '~~/types/shift'

defineProps<{
  isManager: boolean
  label: string
  modelValue: boolean
  shifts: ShiftWithRelations[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'add-shift'): void
  (e: 'delete-shift', shiftId: string): void
}>()
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div
      class="flex max-h-[calc(100dvh-1rem)] min-w-0 flex-col gap-4 overflow-y-auto p-5 sm:min-w-[420px]"
    >
      <div class="pr-10">
        <p class="m-0 text-sm text-[var(--text-muted)]">{{ $t('ui.schedule') }}</p>
        <h2 class="mt-1 text-xl font-bold capitalize">{{ label }}</h2>
      </div>

      <div v-if="shifts.length" class="grid gap-2">
        <MobileShiftCard
          v-for="shift in shifts"
          :key="shift.id"
          employee-order="name-first"
          :shift="shift"
          :is-manager="isManager"
          @delete="$emit('delete-shift', $event)"
        />
      </div>
      <p v-else class="m-0 text-[var(--text-muted)]">{{ $t('ui.noShifts') }}</p>

      <button
        v-if="isManager"
        type="button"
        class="btn min-h-11 w-full"
        @click="$emit('add-shift')"
      >
        {{ $t('btn.addShift') }}
      </button>
    </div>
  </Modal>
</template>
