<script setup lang="ts">
import type { MobileScheduleGridMonth } from '~/composables/useMobileScheduleDates'
import type { ShiftWithRelations } from '~~/types/shift'

const props = defineProps<{
  isManager: boolean
  months: MobileScheduleGridMonth[]
  shiftsByDay: Map<string, ShiftWithRelations[]>
  todayKey: string
}>()

defineEmits<{
  (e: 'add-shift', dayKey: string): void
  (e: 'open-day', dayKey: string): void
}>()

function shiftsForDay(dayKey: string) {
  return props.shiftsByDay.get(dayKey) ?? []
}

function shiftGradient(shift: ShiftWithRelations) {
  return `linear-gradient(135deg, ${shift.position.color} 0%, ${shift.employee.color} 100%)`
}

function initial(value: string) {
  return value.trim().charAt(0).toUpperCase()
}
</script>

<template>
  <div class="mobile-schedule__grid-feed">
    <section
      v-for="month in months"
      :id="`mobile-grid-month-${month.key}`"
      :key="month.key"
      class="mobile-schedule__grid-month"
    >
      <h2 class="mobile-schedule__grid-month-title">{{ month.label }}</h2>
      <div class="mobile-schedule__month-grid">
        <div
          v-for="(day, index) in month.days"
          :id="day ? `mobile-day-${day.key}` : undefined"
          :key="day?.key ?? `empty-${month.key}-${index}`"
          class="mobile-schedule__grid-day cursor-pointer"
          :class="{ 'mobile-schedule__grid-day--today': day?.key === todayKey }"
          @click="day && $emit('open-day', day.key)"
        >
          <template v-if="day">
            <div class="mobile-schedule__grid-day-header">
              <span class="mobile-schedule__grid-weekday">{{ day.weekday }}</span>
              <span class="mobile-schedule__grid-number">{{ day.number }}</span>
              <button
                v-if="isManager"
                type="button"
                class="mobile-schedule__grid-add"
                :aria-label="$t('btn.addShift')"
                :title="$t('btn.addShift')"
                @click.stop="$emit('add-shift', day.key)"
              >+</button>
            </div>
            <div class="mobile-schedule__grid-shifts">
              <div v-for="shift in shiftsForDay(day.key)" :key="shift.id" class="mobile-schedule__grid-shift">
                <span class="mobile-shift__color" :style="{ background: shiftGradient(shift) }" aria-hidden="true" />
                <span :title="`${shift.employee.name} ${shift.employee.surname} · ${shift.position.name}`">
                  {{ initial(shift.position.name) }} / {{ initial(shift.employee.name) }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
