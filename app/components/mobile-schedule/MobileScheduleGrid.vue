<script setup lang="ts">
import type {
  MobileScheduleGridDay,
  MobileScheduleGridMonth,
} from '~/composables/useMobileScheduleDates'
import type { ShiftWithRelations } from '~~/types/shift'

const props = defineProps<{
  isManager: boolean
  months: MobileScheduleGridMonth[]
  shiftsByDay: Map<string, ShiftWithRelations[]>
  todayKey: string
}>()

defineEmits<{
  (e: 'add-shift' | 'open-day', dayKey: string): void
}>()

const { locale } = useI18n()

const weekdayLabels = computed(() => {
  const monday = new Date(Date.UTC(2024, 0, 1))

  return Array.from({ length: 7 }, (_, index) => {
    const label = new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short',
    }).format(new Date(monday.getTime() + index * 86400000))

    return label.replace(/\.$/, '').replace(/^./, (letter) => letter.toUpperCase())
  })
})

function shiftsForDay(dayKey: string) {
  return props.shiftsByDay.get(dayKey) ?? []
}

function monthWeeks(month: MobileScheduleGridMonth) {
  const days = [...month.days]
  const remainder = days.length % 7

  if (remainder) {
    days.push(...Array.from({ length: 7 - remainder }, () => null))
  }

  return Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7))
}

function weekNumber(week: Array<MobileScheduleGridDay | null>) {
  const day = week.find(Boolean)
  if (!day) return ''

  const date = new Date(day.date)
  const dayOfWeek = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayOfWeek + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4))

  return String(1 + Math.round((date.getTime() - firstThursday.getTime()) / 604800000))
}

function totalMinutesForDay(dayKey: string) {
  return shiftsForDay(dayKey).reduce((total, shift) => {
    if (shift.allDay || shift.startTime === null || shift.endTime === null) return total
    return total + Math.max(0, shift.endTime - shift.startTime)
  }, 0)
}

function allDayCount(dayKey: string) {
  return shiftsForDay(dayKey).filter((shift) => shift.allDay).length
}

function totalHoursLabel(dayKey: string) {
  const minutes = totalMinutesForDay(dayKey)
  if (minutes > 0) {
    const hours = Math.round((minutes / 60) * 10) / 10
    return `${hours}${locale.value === 'ru' ? 'ч' : 'h'}`
  }

  return allDayCount(dayKey) > 0 ? (locale.value === 'ru' ? 'день' : 'day') : '—'
}

function shiftMarkers(dayKey: string) {
  return shiftsForDay(dayKey)
    .slice(0, 3)
    .map((shift) => {
      return `linear-gradient(135deg, ${shift.position.color} 0%, ${shift.employee.color} 100%)`
    })
}

function dayTone(dayKey: string) {
  const count = shiftsForDay(dayKey).length
  if (count >= 3) return 'bg-[var(--bg-hover-context)]'
  if (count > 0) return 'bg-[var(--input-bg)]'
  return 'bg-[var(--bg-context)]'
}
</script>

<template>
  <div class="pt-3">
    <section
      v-for="month in months"
      :id="`mobile-grid-month-${month.key}`"
      :key="month.key"
      class="mobile-schedule__grid-month scroll-mt-24"
    >
      <h2 class="mt-4 mb-2 text-xl leading-tight font-bold">{{ month.label }}</h2>

      <div class="grid grid-cols-[1.5rem_repeat(7,minmax(0,1fr))] gap-x-1">
        <div aria-hidden="true" />
        <div
          v-for="weekday in weekdayLabels"
          :key="weekday"
          class="pb-1 text-center text-[0.62rem] font-semibold text-[var(--text-muted)] uppercase"
        >
          {{ weekday }}
        </div>

        <template v-for="week in monthWeeks(month)" :key="weekNumber(week)">
          <div class="pt-2 text-center text-[0.62rem] font-medium text-[var(--text-muted)]">
            {{ weekNumber(week) }}
          </div>
          <div
            v-for="day in week"
            :id="day ? `mobile-day-${day.key}` : undefined"
            :key="day?.key ?? `empty-${month.key}-${weekNumber(week)}`"
            class="relative min-h-[4.5rem] min-w-0 overflow-hidden rounded-md border border-[var(--border-main)] p-1 transition-colors"
            :class="[
              day
                ? `${dayTone(day.key)} cursor-pointer hover:border-[var(--text-blue)]`
                : 'border-transparent',
              day?.key === todayKey
                ? 'border-[var(--primary-border)] shadow-[inset_0_0_0_1px_var(--primary-border)]'
                : '',
            ]"
            @click="day && $emit('open-day', day.key)"
          >
            <template v-if="day">
              <div class="flex items-start justify-between gap-1">
                <span
                  class="text-sm leading-none font-semibold"
                  :class="day.key === todayKey ? 'text-[var(--primary-text)]' : ''"
                >
                  {{ day.number }}
                </span>
                <button
                  v-if="isManager"
                  type="button"
                  class="-mt-1 -mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm leading-none text-[var(--text-muted)] transition hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-main)]"
                  :aria-label="$t('btn.addShift')"
                  :title="$t('btn.addShift')"
                  @click.stop="$emit('add-shift', day.key)"
                >
                  +
                </button>
              </div>

              <div
                v-if="shiftsForDay(day.key).length"
                class="mt-2 grid gap-0.5 text-[0.65rem] leading-tight text-[var(--text-soft)]"
              >
                <span class="font-semibold">{{ shiftsForDay(day.key).length }}×</span>
                <span>{{ totalHoursLabel(day.key) }}</span>
              </div>

              <div
                v-if="shiftsForDay(day.key).length"
                class="absolute right-1 bottom-1 left-1 flex gap-0.5"
              >
                <span
                  v-for="(marker, markerIndex) in shiftMarkers(day.key)"
                  :key="`${day.key}-${markerIndex}`"
                  class="h-1.5 min-w-0 flex-1 rounded-full"
                  :style="{ background: marker }"
                  aria-hidden="true"
                />
              </div>
            </template>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
