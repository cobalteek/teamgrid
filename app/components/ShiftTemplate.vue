<script setup lang="ts">
import type { CreateShift, ScheduleTemplate } from '~~/types/shift'

const props = defineProps<{
  date: any
  modelValue: ScheduleTemplate
  shift: CreateShift
  templateEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: ScheduleTemplate): void
  (e: 'update:shift', v: CreateShift): void
  (e: 'update:templateEnabled', v: boolean): void
}>()

const templateGrid = ref<ScheduleTemplate>({
  workDays: props.modelValue.workDays,
  restDays: props.modelValue.restDays,
  endDate: props.modelValue.endDate,
  weekdays: props.modelValue.weekdays ?? ([] as number[]),
})

const weekDays = [
  { value: 1, label: 'ui.days.monday' },
  { value: 2, label: 'ui.days.tuesday' },
  { value: 3, label: 'ui.days.wednesday' },
  { value: 4, label: 'ui.days.thursday' },
  { value: 5, label: 'ui.days.friday' },
  { value: 6, label: 'ui.days.saturday' },
  { value: 7, label: 'ui.days.sunday' },
]
const modeToggle = ref(<'weekdays' | 'days' | 'state'>'state')
const other = ref(false)
const formatedDate = ref()

function minutesToTime(value: number | undefined) {
  const minutes = value ?? 0
  const hours = Math.floor(minutes / 60)
  const restMinutes = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(restMinutes).padStart(2, '0')}`
}

function timeToMinutes(value: string) {
  const [hours = 0, minutes = 0] = value.split(':').map(Number)
  return hours * 60 + minutes
}

const enableShiftTime = computed({
  get: () => !props.shift.allDay,
  set: (enabled: boolean) => {
    emit('update:shift', {
      ...props.shift,
      allDay: !enabled,
      startTime: enabled ? (props.shift.startTime ?? 9 * 60) : undefined,
      endTime: enabled ? (props.shift.endTime ?? 18 * 60) : undefined,
    })
  },
})

const shiftStartTime = computed({
  get: () => minutesToTime(props.shift.startTime),
  set: (value: string) => {
    emit('update:shift', { ...props.shift, startTime: timeToMinutes(value) })
  },
})

const shiftEndTime = computed({
  get: () => minutesToTime(props.shift.endTime),
  set: (value: string) => {
    emit('update:shift', { ...props.shift, endTime: timeToMinutes(value) })
  },
})

if (props.date) {
  formatedDate.value = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
  }).format(props.date)
} else {
  formatedDate.value = ''
}

function getTemplate(workDays: number, restDays: number) {
  templateGrid.value.workDays = workDays
  templateGrid.value.restDays = restDays
}

function resetWeekdays() {
  templateGrid.value.weekdays = []
}

function resetDays() {
  templateGrid.value.workDays = 0
  templateGrid.value.restDays = 0
  other.value = false
}

watch(
  templateGrid,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true },
)

watch(
  () => props.templateEnabled,
  (value) => {
    if (!value) {
      resetWeekdays()
      resetDays()
      modeToggle.value = 'state'
    }
  },
)
</script>

<template>
  <div class="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
    <section class="flex min-w-0 flex-col rounded-md border border-[var(--border-main)] p-3">
      <label class="flex min-h-10 cursor-pointer items-center gap-3 font-medium">
        <input v-model="enableShiftTime" type="checkbox" class="h-5 w-5" />
        <span>{{ $t('ui.shiftTime') }}</span>
      </label>
      <fieldset
        :disabled="!enableShiftTime"
        class="mt-3 grid grid-cols-2 gap-3 disabled:opacity-40"
      >
        <label class="flex min-w-0 flex-col gap-1 text-sm">
          <span>{{ $t('ui.timeFrom') }}</span>
          <input
            v-model="shiftStartTime"
            type="time"
            class="min-h-11 min-w-0 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-[var(--input-text)]"
          />
        </label>
        <label class="flex min-w-0 flex-col gap-1 text-sm">
          <span>{{ $t('ui.timeTo') }}</span>
          <input
            v-model="shiftEndTime"
            type="time"
            class="min-h-11 min-w-0 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-[var(--input-text)]"
          />
        </label>
      </fieldset>
    </section>

    <section class="flex min-w-0 flex-col rounded-md border border-[var(--border-main)] p-3">
      <label class="flex min-h-10 cursor-pointer items-center gap-3 font-medium">
        <input
          :checked="templateEnabled"
          type="checkbox"
          class="h-5 w-5"
          @change="emit('update:templateEnabled', ($event.target as HTMLInputElement).checked)"
        />
        <span>{{ $t('ui.templateGrid') }}</span>
      </label>

      <fieldset :disabled="!templateEnabled" class="mt-3 flex flex-col gap-3 disabled:opacity-40">
        <p class="text-sm text-[var(--text-muted)]">
          {{ $t('ui.startDate') + ': ' + formatedDate }}
        </p>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('ui.endDate') }}</span>
          <input
            v-model="templateGrid.endDate"
            type="date"
            class="min-h-11 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-[var(--input-text)]"
          />
        </label>
        <p class="text-sm">{{ $t('ui.templateInfoDays') }}</p>
        <div
          :disabled="modeToggle"
          :class="[modeToggle === 'days' || modeToggle === 'state' ? '' : 'opacity-30']"
          @click="[(modeToggle = 'days'), resetWeekdays()]"
          class="inline-flex gap-1"
        >
          <TemplatePresetButton
            :work-days="5"
            :rest-days="2"
            :active="templateGrid.workDays === 5 && templateGrid.restDays === 2"
            @select="getTemplate(5, 2)"
          />
          <TemplatePresetButton
            :work-days="4"
            :rest-days="2"
            :active="templateGrid.workDays === 4 && templateGrid.restDays === 2"
            @select="getTemplate(4, 2)"
          />
          <TemplatePresetButton
            :work-days="3"
            :rest-days="3"
            :active="templateGrid.workDays === 3 && templateGrid.restDays === 3"
            @select="getTemplate(3, 3)"
          />
          <TemplatePresetButton
            :work-days="2"
            :rest-days="2"
            :active="templateGrid.workDays === 2 && templateGrid.restDays === 2"
            @select="getTemplate(2, 2)"
          />
          <button
            type="button"
            class="w-fit rounded-md border border-[var(--border-main)] bg-[var(--bg-main)] px-2 text-sm text-[var(--text-main)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)]"
            @click="other = !other"
          >
            {{ '+' }}
          </button>
        </div>
        <div :disabled="!other" v-if="other" class="grid grid-cols-2 gap-3">
          <label class="flex min-w-0 flex-col gap-1 text-sm">
            <span>{{ $t('ui.workDays') }}</span>
            <input
              v-model="templateGrid.workDays"
              type="number"
              min="1"
              class="min-h-11 min-w-0 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-center text-[var(--input-text)]"
            />
          </label>
          <label class="flex min-w-0 flex-col gap-1 text-sm">
            <span>{{ $t('ui.restDays') }}</span>
            <input
              v-model="templateGrid.restDays"
              type="number"
              min="0"
              class="min-h-11 min-w-0 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-center text-[var(--input-text)]"
            />
          </label>
        </div>
        <div :@click="[(modeToggle = 'weekdays'), resetDays()]">
          <p class="text-sm">{{ $t('ui.templateInfoWeek') }}</p>
          <label
            v-for="day in weekDays"
            :key="day.value"
            class="inline-flex min-h-10 cursor-pointer items-center font-medium"
            :class="[modeToggle === 'weekdays' || modeToggle === 'state' ? '' : 'opacity-30']"
          >
            <input
              type="checkbox"
              class="peer sr-only"
              :disabled="modeToggle !== 'weekdays'"
              v-model="templateGrid.weekdays"
              :value="day.value"
            />
            <span
              class="flex h-11 items-center justify-center rounded-full border border-[var(--border-main)] bg-[var(--bg-main)] px-1 text-sm font-medium text-[var(--text-main)] transition-all peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] md:px-3"
            >
              {{ $t(day.label) }}
            </span>
          </label>
        </div>
      </fieldset>
    </section>
  </div>
</template>
