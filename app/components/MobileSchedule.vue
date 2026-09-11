<script setup lang="ts">
import { useShiftStore } from '~/stores/shift'

const props = defineProps<{ isManager: boolean }>()
const emit = defineEmits<{ (e: 'add-shift', dateKey: string): void }>()
const { locale } = useI18n()
const shiftStore = useShiftStore()

function toDateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function startOfToday() {
  const today = new Date()
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function addMonths(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
}

function toMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + amount)
  return result
}

function daysBetween(start: Date, end: Date) {
  const days: Array<{ key: string; date: Date }> = []
  for (let date = new Date(start); date < end; date = addDays(date, 1)) {
    days.push({ key: toDateKey(date), date })
  }
  return days
}

function monthsBetween(start: Date, end: Date) {
  const months: Date[] = []
  for (let date = startOfMonth(start); date < end; date = addMonths(date, 1)) {
    months.push(new Date(date))
  }
  return months
}

const todayKey = toDateKey(startOfToday())
const selectedMonth = ref(toMonthKey(startOfToday()))
const loadedStart = ref(startOfToday())
const loadedEnd = ref(addMonths(loadedStart.value, 1))
const viewMode = ref<'feed' | 'grid'>('feed')
const isLoadingPrevious = ref(false)
const isLoadingNext = ref(false)
const hasScrolledIntoFeed = ref(false)
const previousSentinel = ref<HTMLElement | null>(null)
const nextSentinel = ref<HTMLElement | null>(null)
const gridPreviousSentinel = ref<HTMLElement | null>(null)
const gridNextSentinel = ref<HTMLElement | null>(null)
const gridLoadedStart = ref(startOfMonth(startOfToday()))
const gridLoadedEnd = ref(addMonths(gridLoadedStart.value, 1))
let observer: IntersectionObserver | null = null

const days = computed(() => daysBetween(loadedStart.value, loadedEnd.value).map(({ key, date }) => ({
  key,
  date,
  day: new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' }).format(date).replace('.', ''),
  number: date.getUTCDate(),
  month: new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', { month: 'short' }).format(date).replace('.', ''),
})))

const monthOptions = computed(() => Array.from({ length: 25 }, (_, index) => {
  const date = addMonths(startOfToday(), index - 12)
  const label = new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date).replace(' г.', '')

  return {
    value: toMonthKey(date),
    label: capitalize(label),
  }
}))

const gridMonths = computed(() => monthsBetween(gridLoadedStart.value, gridLoadedEnd.value))

function shiftsForDay(dayKey: string) {
  return shiftStore.shifts.filter(shift => toDateKey(shift.date) === dayKey)
}

function monthLabel(date: Date) {
  const label = new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date).replace(' г.', '')
  return capitalize(label)
}

function gridDaysForMonth(monthStart: Date) {
  const offset = (monthStart.getUTCDay() + 6) % 7
  return [
    ...Array.from({ length: offset }, () => null),
    ...daysBetween(monthStart, addMonths(monthStart, 1)).map(({ key, date }) => ({
      key,
      date,
      number: date.getUTCDate(),
      weekday: new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
        weekday: 'short',
      }).format(date).replace('.', '').replace(/^./, letter => letter.toUpperCase()),
    })),
  ]
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function updateVisibleMonth() {
  const heading = document.querySelector('.mobile-schedule__heading')
  const headingBottom = heading?.getBoundingClientRect().bottom ?? 0
  const visibleDay = Array.from(document.querySelectorAll<HTMLElement>('.mobile-schedule__day, .mobile-schedule__grid-month'))
    .find(day => day.getBoundingClientRect().bottom > headingBottom + 4)

  if (visibleDay) {
    if (visibleDay.classList.contains('mobile-schedule__grid-month')) {
      selectedMonth.value = visibleDay.id.replace('mobile-grid-month-', '')
    } else {
      const dayKey = visibleDay.id.replace('mobile-day-', '')
      selectedMonth.value = dayKey.slice(0, 7)
    }
  }
}

async function loadMonth(month: Date, direction: 'previous' | 'next') {
  const monthStart = startOfMonth(month)
  const monthEnd = addMonths(monthStart, 1)
  const loading = direction === 'previous' ? isLoadingPrevious : isLoadingNext
  if (loading.value) return
  loading.value = true

  try {
    await shiftStore.getShifts(undefined, {
      startDate: toDateKey(monthStart),
      endDate: toDateKey(monthEnd),
      merge: true,
    })
    if (direction === 'previous') loadedStart.value = monthStart
    else loadedEnd.value = monthEnd
  } finally {
    loading.value = false
  }
}

async function loadPreviousMonth() {
  const oldTop = previousSentinel.value?.getBoundingClientRect().top ?? 0
  const currentMonthStart = startOfMonth(loadedStart.value)

  if (currentMonthStart < loadedStart.value) {
    isLoadingPrevious.value = true
    try {
      await shiftStore.getShifts(undefined, {
        startDate: toDateKey(currentMonthStart),
        endDate: toDateKey(loadedStart.value),
        merge: true,
      })
      loadedStart.value = currentMonthStart
    } finally {
      isLoadingPrevious.value = false
    }
  } else {
    await loadMonth(addMonths(currentMonthStart, -1), 'previous')
  }
  await nextTick()
  const newTop = previousSentinel.value?.getBoundingClientRect().top ?? oldTop
  window.scrollBy({ top: newTop - oldTop })
}

async function loadNextMonth() {
  await loadMonth(loadedEnd.value, 'next')
}

async function goToMonth(monthKey: string, requireFullMonth = false) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return
  const month = new Date(`${monthKey}-01T00:00:00Z`)
  if (Number.isNaN(month.getTime())) return

  selectedMonth.value = monthKey

  const monthStart = startOfMonth(month)
  const monthEnd = addMonths(monthStart, 1)
  const isLoaded = month >= loadedStart.value && month < loadedEnd.value
  const isFullMonthLoaded = monthStart >= loadedStart.value && monthEnd <= loadedEnd.value

  if ((!requireFullMonth && isLoaded) || (requireFullMonth && isFullMonthLoaded)) {
    await scrollToDay(`${monthKey}-01`)
    return
  }

  isLoadingNext.value = true
  try {
    await shiftStore.getShifts(undefined, {
      startDate: toDateKey(monthStart),
      endDate: toDateKey(addMonths(monthStart, 1)),
      merge: true,
    })
    loadedStart.value = monthStart
    loadedEnd.value = addMonths(monthStart, 1)
    if (viewMode.value === 'grid') {
      gridLoadedStart.value = monthStart
      gridLoadedEnd.value = addMonths(monthStart, 1)
    }
    await nextTick()
    await scrollToDay(`${monthKey}-01`)
  } finally {
    isLoadingNext.value = false
  }
}

async function loadInitialMonth() {
  isLoadingNext.value = true
  try {
    await shiftStore.getShifts(undefined, {
      startDate: toDateKey(loadedStart.value),
      endDate: toDateKey(loadedEnd.value),
      merge: true,
    })
  } finally {
    isLoadingNext.value = false
  }
}

async function scrollToDay(dayKey: string) {
  await nextTick()
  const element = document.getElementById(`mobile-day-${dayKey}`)
  if (!element) return
  const heading = document.querySelector<HTMLElement>('.mobile-schedule__heading')
  const offset = (heading?.getBoundingClientRect().height ?? 0) + 8
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

async function scrollToToday() {
  if (selectedMonth.value !== toMonthKey(startOfToday())) {
    await goToMonth(toMonthKey(startOfToday()), true)
    return
  }
  await scrollToDay(todayKey)
}

async function setViewMode(mode: 'feed' | 'grid') {
  if (mode === 'grid') {
    await goToMonth(selectedMonth.value, true)
    const month = new Date(`${selectedMonth.value}-01T00:00:00Z`)
    gridLoadedStart.value = startOfMonth(month)
    gridLoadedEnd.value = addMonths(gridLoadedStart.value, 1)
  }
  viewMode.value = mode
}

async function loadGridMonth(month: Date, direction: 'previous' | 'next') {
  const monthStart = startOfMonth(month)
  const monthEnd = addMonths(monthStart, 1)
  const loading = direction === 'previous' ? isLoadingPrevious : isLoadingNext
  if (loading.value) return
  loading.value = true

  try {
    await shiftStore.getShifts(undefined, {
      startDate: toDateKey(monthStart),
      endDate: toDateKey(monthEnd),
      merge: true,
    })
    if (direction === 'previous') gridLoadedStart.value = monthStart
    else gridLoadedEnd.value = monthEnd
  } finally {
    loading.value = false
  }
}

async function loadPreviousGridMonth() {
  const oldTop = gridPreviousSentinel.value?.getBoundingClientRect().top ?? 0
  await loadGridMonth(addMonths(gridLoadedStart.value, -1), 'previous')
  await nextTick()
  const newTop = gridPreviousSentinel.value?.getBoundingClientRect().top ?? oldTop
  window.scrollBy({ top: newTop - oldTop })
}

async function loadNextGridMonth() {
  await loadGridMonth(gridLoadedEnd.value, 'next')
}

function observeSentinels() {
  if (!observer) return
  observer.disconnect()
  if (viewMode.value === 'feed') {
    if (previousSentinel.value) observer.observe(previousSentinel.value)
    if (nextSentinel.value) observer.observe(nextSentinel.value)
  } else {
    if (gridPreviousSentinel.value) observer.observe(gridPreviousSentinel.value)
    if (gridNextSentinel.value) observer.observe(gridNextSentinel.value)
  }
}

async function deleteShift(shiftId: string) {
  if (!confirm($t('ui.shiftDeleteConfirm') as string)) return
  await shiftStore.deleteShift(shiftId)
}

function markFeedScroll() {
  if (window.scrollY > 120) hasScrolledIntoFeed.value = true
  updateVisibleMonth()
}

onMounted(async () => {
  if (!window.matchMedia('(max-width: 767px)').matches) return
  await loadInitialMonth()
  window.addEventListener('scroll', markFeedScroll, { passive: true })
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      if (entry.target === previousSentinel.value && hasScrolledIntoFeed.value) loadPreviousMonth()
      if (entry.target === nextSentinel.value) loadNextMonth()
      if (entry.target === gridPreviousSentinel.value && hasScrolledIntoFeed.value) loadPreviousGridMonth()
      if (entry.target === gridNextSentinel.value) loadNextGridMonth()
    })
  }, { rootMargin: '500px 0px' })
  observeSentinels()
  await nextTick()
  updateVisibleMonth()
})

watch(viewMode, async () => {
  await nextTick()
  observeSentinels()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', markFeedScroll)
})
</script>

<template>
  <section class="mobile-schedule" aria-label="Mobile schedule">
    <div class="mobile-schedule__heading">
      <select
        v-model="selectedMonth"
        class="mobile-schedule__month-select mobile-schedule__month-select--title"
        :aria-label="$t('ui.schedule')"
        @change="goToMonth(selectedMonth)"
      >
        <option v-for="month in monthOptions" :key="month.value" :value="month.value">
          {{ month.label }}
        </option>
      </select>
      <div class="mobile-schedule__heading-actions">
        <div class="mobile-schedule__view-toggle" role="group" :aria-label="$t('ui.scheduleView')">
          <button
            type="button"
            :class="{ 'mobile-schedule__view-button--active': viewMode === 'feed' }"
            @click="setViewMode('feed')"
          >
            {{ $t('ui.feedView') }}
          </button>
          <button
            type="button"
            :class="{ 'mobile-schedule__view-button--active': viewMode === 'grid' }"
            @click="setViewMode('grid')"
          >
            {{ $t('ui.gridView') }}
          </button>
        </div>
        <button type="button" class="mobile-schedule__today" @click="scrollToToday">
          {{ $t('ui.today') }}
        </button>
      </div>
    </div>

    <template v-if="viewMode === 'feed'">
      <div ref="previousSentinel" class="mobile-schedule__sentinel" aria-hidden="true">
        <span v-if="isLoadingPrevious" class="mobile-schedule__loading">{{ $t('ui.loading') }}</span>
      </div>

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
            <p class="mobile-schedule__dayname">{{ capitalize(day.day) }}, {{ day.number }} {{ day.month }}</p>
            <p class="mobile-schedule__count">{{ shiftsForDay(day.key).length }} {{ $t('ui.shifts') }}</p>
          </div>
          <button
            v-if="props.isManager"
            type="button"
            class="mobile-schedule__add"
            :aria-label="$t('btn.addShift')"
            :title="$t('btn.addShift')"
            @click="emit('add-shift', day.key)"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <div v-if="shiftsForDay(day.key).length" class="mobile-schedule__list">
          <article v-for="shift in shiftsForDay(day.key)" :key="shift.id" class="mobile-shift">
            <span class="mobile-shift__color" :style="{ backgroundColor: shift.position.color }" aria-hidden="true" />
            <div class="mobile-shift__content">
              <p class="mobile-shift__position">{{ shift.position.name }}</p>
              <p class="mobile-shift__employee">{{ shift.employee.surname }} {{ shift.employee.name }}</p>
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
        <p v-else class="mobile-schedule__empty-day">{{ $t('ui.noShifts') }}</p>
      </article>
      </div>

      <div ref="nextSentinel" class="mobile-schedule__sentinel" aria-live="polite">
        <span v-if="isLoadingNext" class="mobile-schedule__loading">{{ $t('ui.loading') }}</span>
      </div>
    </template>

    <template v-else>
      <div ref="gridPreviousSentinel" class="mobile-schedule__sentinel" aria-hidden="true">
        <span v-if="isLoadingPrevious" class="mobile-schedule__loading">{{ $t('ui.loading') }}</span>
      </div>

      <div class="mobile-schedule__grid-feed">
        <section
          v-for="month in gridMonths"
          :id="`mobile-grid-month-${toMonthKey(month)}`"
          :key="toMonthKey(month)"
          class="mobile-schedule__grid-month"
        >
          <h2 class="mobile-schedule__grid-month-title">{{ monthLabel(month) }}</h2>
          <div class="mobile-schedule__month-grid">
            <div
              v-for="(day, index) in gridDaysForMonth(month)"
              :id="day ? `mobile-day-${day.key}` : undefined"
              :key="day?.key ?? `empty-${toMonthKey(month)}-${index}`"
              class="mobile-schedule__grid-day"
              :class="{ 'mobile-schedule__grid-day--today': day?.key === todayKey }"
            >
              <template v-if="day">
                <div class="mobile-schedule__grid-day-header">
                  <span class="mobile-schedule__grid-weekday">{{ day.weekday }}</span>
                  <span class="mobile-schedule__grid-number">{{ day.number }}</span>
                  <button
                    v-if="props.isManager"
                    type="button"
                    class="mobile-schedule__grid-add"
                    :aria-label="$t('btn.addShift')"
                    :title="$t('btn.addShift')"
                    @click="emit('add-shift', day.key)"
                  >+</button>
                </div>
                <div class="mobile-schedule__grid-shifts">
                  <div v-for="shift in shiftsForDay(day.key)" :key="shift.id" class="mobile-schedule__grid-shift">
                    <span class="mobile-shift__color" :style="{ backgroundColor: shift.position.color }" aria-hidden="true" />
                    <span>{{ shift.employee.surname }} {{ shift.employee.name }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>
      </div>

      <div ref="gridNextSentinel" class="mobile-schedule__sentinel" aria-live="polite">
        <span v-if="isLoadingNext" class="mobile-schedule__loading">{{ $t('ui.loading') }}</span>
      </div>
    </template>
  </section>
</template>
