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
})

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

watch(
  templateGrid,
  (value) => {
    emit('update:modelValue', value)
  },
  { deep: true },
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
        <div class="grid grid-cols-2 gap-3">
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
      </fieldset>
    </section>
  </div>
</template>
