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
  <div class="pt-3">
    <section
      v-for="month in months"
      :id="`mobile-grid-month-${month.key}`"
      :key="month.key"
      class="mobile-schedule__grid-month scroll-mt-24"
    >
      <h2 class="mt-4 mb-2 text-xl leading-tight font-bold">{{ month.label }}</h2>
      <div class="grid auto-rows-[minmax(5.6rem,auto)] grid-cols-7 gap-1">
        <div
          v-for="(day, index) in month.days"
          :id="day ? `mobile-day-${day.key}` : undefined"
          :key="day?.key ?? `empty-${month.key}-${index}`"
          class="min-w-0 cursor-pointer overflow-hidden rounded-md border border-[var(--border-main)] bg-[var(--bg-context)] p-1.5"
          :class="{
            'border-[var(--primary-border)] shadow-[inset_0_0_0_1px_var(--primary-border)]':
              day?.key === todayKey,
          }"
          @click="day && $emit('open-day', day.key)"
        >
          <template v-if="day">
            <div
              class="flex items-center justify-between text-xs font-bold text-[var(--text-main)]"
            >
              <span class="min-w-0 truncate text-[0.62rem] font-medium text-[var(--text-muted)]">{{
                day.weekday
              }}</span>
              <span class="ml-auto text-xs">{{ day.number }}</span>
              <button
                v-if="isManager"
                type="button"
                class="h-[1.4rem] w-[1.4rem] text-base leading-none text-[var(--text-muted)]"
                :aria-label="$t('btn.addShift')"
                :title="$t('btn.addShift')"
                @click.stop="$emit('add-shift', day.key)"
              >
                +
              </button>
            </div>
            <div class="mt-1.5 grid gap-1">
              <div
                v-for="shift in shiftsForDay(day.key)"
                :key="shift.id"
                class="flex min-w-0 items-center gap-1 text-[0.62rem] leading-tight text-[var(--text-soft)]"
              >
                <span
                  class="h-3 w-1 shrink-0 rounded-full"
                  :style="{ background: shiftGradient(shift) }"
                  aria-hidden="true"
                />
                <span
                  class="truncate"
                  :title="`${shift.employee.name} ${shift.employee.surname} · ${shift.position.name}`"
                >
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
