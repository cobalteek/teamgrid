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
  <div class="mobile-schedule__feed">
    <article
      v-for="day in days"
      :id="`mobile-day-${day.key}`"
      :key="day.key"
      class="mobile-schedule__day"
      :class="{ 'mobile-schedule__day--today': day.key === todayKey }"
    >
      <div class="mobile-schedule__daybar">
        <div>
          <p class="mobile-schedule__dayname">
            {{ capitalize(day.weekday) }}, {{ day.number }} {{ day.month }}
          </p>
          <p class="mobile-schedule__count">
            {{ shiftsForDay(day.key).length }} {{ $t('ui.shifts') }}
          </p>
        </div>
        <button
          v-if="isManager"
          type="button"
          class="mobile-schedule__add"
          :aria-label="$t('btn.addShift')"
          :title="$t('btn.addShift')"
          @click="$emit('add-shift', day.key)"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <div v-if="shiftsForDay(day.key).length" class="mobile-schedule__list">
        <MobileShiftCard
          v-for="shift in shiftsForDay(day.key)"
          :key="shift.id"
          :shift="shift"
          :is-manager="isManager"
          @delete="$emit('delete-shift', $event)"
        />
      </div>
      <p v-else class="mobile-schedule__empty-day">{{ $t('ui.noShifts') }}</p>
    </article>
  </div>
</template>
