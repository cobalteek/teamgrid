<script setup lang="ts">
import { useShiftStore } from '~/stores/shift'

const props = defineProps<{
  isManager: boolean
}>()

const emit = defineEmits<{
  (e: 'add-shift', dateKey: string): void
}>()

const { locale } = useI18n()
const shiftStore = useShiftStore()

function toDateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + amount)
  return result
}

function startOfToday() {
  const today = new Date()
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
}

const selectedDate = ref(toDateKey(startOfToday()))

const rangeStart = computed(() => new Date(`${selectedDate.value}T00:00:00Z`))

const days = computed(() => Array.from({ length: 14 }, (_, index) => {
  const date = addDays(rangeStart.value, index)
  const key = toDateKey(date)

  return {
    key,
    date,
    day: new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short',
    }).format(date).replace('.', ''),
    number: date.getUTCDate(),
    month: new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'short',
    }).format(date).replace('.', ''),
  }
}))

const selectedDay = computed(() => days.value.find(day => day.key === selectedDate.value) ?? days.value[0])
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
const selectedShifts = computed(() => shiftStore.shifts.filter(
  shift => toDateKey(shift.date) === selectedDate.value,
))

function moveRange(amount: number) {
  selectedDate.value = toDateKey(addDays(rangeStart.value, amount))
}

function goToday() {
  selectedDate.value = toDateKey(startOfToday())
}

async function deleteShift(shiftId: string) {
  if (!confirm($t('ui.shiftDeleteConfirm') as string)) return
  await shiftStore.deleteShift(shiftId)
}
</script>

<template>
  <section class="mobile-schedule" aria-label="Mobile schedule">
    <div class="mobile-schedule__heading">
      <div>
        <p class="mobile-schedule__eyebrow">{{ $t('ui.schedule') }}</p>
        <h1 class="mobile-schedule__title">{{ capitalize(selectedDay?.month || '') }} {{ selectedDay?.number }}</h1>
      </div>
      <button
        type="button"
        class="mobile-schedule__today"
        @click="goToday"
      >
        {{ $t('ui.today') }}
      </button>
    </div>

    <div class="mobile-schedule__controls">
      <button
        type="button"
        class="mobile-schedule__arrow"
        :aria-label="$t('ui.previousWeek')"
        :title="$t('ui.previousWeek')"
        @click="moveRange(-7)"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div class="mobile-schedule__days hide-scrollbar" role="listbox" :aria-label="$t('ui.scheduleDays')">
        <button
          v-for="day in days"
          :key="day.key"
          type="button"
          class="mobile-day"
          :class="{ 'mobile-day--active': day.key === selectedDate }"
          :aria-selected="day.key === selectedDate"
          role="option"
          @click="selectedDate = day.key"
        >
          <span class="mobile-day__name">{{ day.day }}</span>
          <span class="mobile-day__number">{{ day.number }}</span>
          <span class="mobile-day__month">{{ day.month }}</span>
        </button>
      </div>

      <button
        type="button"
        class="mobile-schedule__arrow"
        :aria-label="$t('ui.nextWeek')"
        :title="$t('ui.nextWeek')"
        @click="moveRange(7)"
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>

    <div class="mobile-schedule__daybar">
      <div>
        <p class="mobile-schedule__dayname">{{ selectedDay?.day }}, {{ selectedDay?.number }} {{ selectedDay?.month }}</p>
        <p class="mobile-schedule__count">
          {{ selectedShifts.length }} {{ $t('ui.shifts') }}
        </p>
      </div>
      <button
        v-if="props.isManager"
        type="button"
        class="mobile-schedule__add"
        :aria-label="$t('btn.addShift')"
        :title="$t('btn.addShift')"
        @click="emit('add-shift', selectedDate)"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>

    <div v-if="selectedShifts.length" class="mobile-schedule__list">
      <article
        v-for="shift in selectedShifts"
        :key="shift.id"
        class="mobile-shift"
      >
        <span
          class="mobile-shift__color"
          :style="{ backgroundColor: shift.position.color }"
          aria-hidden="true"
        />
        <div class="mobile-shift__content">
          <p class="mobile-shift__position">{{ shift.position.name }}</p>
          <p class="mobile-shift__employee">
            {{ shift.employee.surname }} {{ shift.employee.name }}
          </p>
        </div>
        <button
          v-if="props.isManager"
          type="button"
          class="mobile-shift__delete"
          :aria-label="$t('btn.delete')"
          :title="$t('btn.delete')"
          @click="deleteShift(shift.id)"
        >
          <span aria-hidden="true">×</span>
        </button>
      </article>
    </div>

    <div v-else class="mobile-schedule__empty">
      <p>{{ $t('ui.noShifts') }}</p>
      <button
        v-if="props.isManager"
        type="button"
        class="btn btn-primary mobile-schedule__empty-action"
        @click="emit('add-shift', selectedDate)"
      >
        {{ $t('btn.addShift') }}
      </button>
    </div>
  </section>
</template>
