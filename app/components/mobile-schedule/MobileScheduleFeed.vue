<script setup lang="ts">
import MobileShiftCard from './MobileShiftCard.vue'
import type { MobileScheduleDay } from '~/composables/useMobileScheduleDates'
import type { ShiftWithRelations } from '~~/types/shift'

const props = defineProps<{
  days: MobileScheduleDay[]
  isManager: boolean
  shiftsByDay: Map<string, ShiftWithRelations[]>
  todayKey: string
}>()

defineEmits<{
  (e: 'add-shift', dayKey: string): void
  (e: 'delete-shift', shiftId: string): void
}>()

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function shiftsForDay(dayKey: string) {
  return props.shiftsByDay.get(dayKey) ?? []
}
</script>

<template>
  <div>
    <article
      v-for="day in days"
      :id="`mobile-day-${day.key}`"
      :key="day.key"
      class="mobile-schedule__day scroll-mt-24"
    >
      <div
        class="mt-3.5 flex items-center justify-between gap-3 border-y border-[var(--border-main)] py-3.5"
        :class="{ 'border-t-[var(--primary-border)]': day.key === todayKey }"
      >
        <div>
          <p
            class="m-0 mb-0.5 text-base font-bold capitalize"
            :class="{ 'text-[var(--primary-text)]': day.key === todayKey }"
          >
            {{ capitalize(day.weekday) }}, {{ day.number }} {{ day.month }}
          </p>
          <p class="m-0 text-xs text-[var(--text-muted)]">
            {{ shiftsForDay(day.key).length }} {{ $t('ui.shifts') }}
          </p>
        </div>
        <button
          v-if="isManager"
          type="button"
          class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[0.65rem] bg-[var(--primary)] text-2xl leading-none text-white transition duration-100 hover:bg-[var(--primary-hover)] active:scale-95"
          :aria-label="$t('btn.addShift')"
          :title="$t('btn.addShift')"
          @click="$emit('add-shift', day.key)"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div v-if="shiftsForDay(day.key).length" class="grid gap-2.5 pt-3.5">
        <MobileShiftCard
          v-for="shift in shiftsForDay(day.key)"
          :key="shift.id"
          :shift="shift"
          :is-manager="isManager"
          @delete="$emit('delete-shift', $event)"
        />
      </div>
      <p v-else class="m-0 pt-2.5 pb-1 text-sm text-[var(--text-muted)]">{{ $t('ui.noShifts') }}</p>
    </article>
  </div>
</template>
