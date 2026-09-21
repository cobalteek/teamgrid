<script setup lang="ts">
import MobileScheduleDayModal from './mobile-schedule/MobileScheduleDayModal.vue'
import MobileScheduleFeed from './mobile-schedule/MobileScheduleFeed.vue'
import MobileScheduleGrid from './mobile-schedule/MobileScheduleGrid.vue'
import MobileScheduleToolbar from './mobile-schedule/MobileScheduleToolbar.vue'
import { useShiftStore } from '~/stores/shift'
import {
  useMobileScheduleDates,
  type MobileScheduleViewMode,
} from '~/composables/useMobileScheduleDates'
import type { Ref } from 'vue'
import type { ShiftWithRelations } from '~~/types/shift'

const props = defineProps<{ isManager: boolean }>()
const emit = defineEmits<{ (e: 'add-shift', dateKey: string): void }>()

const { locale } = useI18n()
const shiftStore = useShiftStore()
const {
  addMonths,
  daysBetween,
  feedDay,
  gridDaysForMonth,
  monthLabel,
  monthsBetween,
  parseMonthKey,
  selectedDayLabel,
  startOfMonth,
  startOfToday,
  toDateKey,
  toMonthKey,
} = useMobileScheduleDates(locale)

const todayKey = toDateKey(startOfToday())
const selectedMonth = ref(toMonthKey(startOfToday()))
const loadedStart = ref(startOfToday())
const loadedEnd = ref(addMonths(loadedStart.value, 1))
const viewMode = ref<MobileScheduleViewMode>('feed')
const isLoadingPrevious = ref(false)
const isLoadingNext = ref(false)
const hasScrolledDown = reactive<Record<MobileScheduleViewMode, boolean>>({
  feed: false,
  grid: false,
})
const scrollDirection = ref<'up' | 'down' | null>(null)
const scheduleRoot = ref<HTMLElement | null>(null)
const previousSentinel = ref<HTMLElement | null>(null)
const nextSentinel = ref<HTMLElement | null>(null)
const gridPreviousSentinel = ref<HTMLElement | null>(null)
const gridNextSentinel = ref<HTMLElement | null>(null)
const previousSentinelInView = ref(false)
const nextSentinelInView = ref(false)
const gridPreviousSentinelInView = ref(false)
const gridNextSentinelInView = ref(false)
const gridLoadedStart = ref(loadedStart.value)
const gridLoadedEnd = ref(loadedEnd.value)
const selectedGridDay = ref<string | null>(null)
let observer: IntersectionObserver | null = null
let lastScrollY = 0
let isProgrammaticScroll = false

const days = computed(() =>
  daysBetween(loadedStart.value, loadedEnd.value).map(({ date }) => feedDay(date)),
)

const gridMonths = computed(() => monthsBetween(gridLoadedStart.value, gridLoadedEnd.value))

const gridMonthSections = computed(() =>
  gridMonths.value.map((month) => ({
    key: toMonthKey(month),
    label: monthLabel(month),
    days: gridDaysForMonth(month),
  })),
)

const monthOptions = computed(() => {
  const todayMonth = startOfMonth(startOfToday())
  const selected = parseMonthKey(selectedMonth.value) ?? todayMonth
  const start = minDate(
    addMonths(todayMonth, -12),
    loadedStart.value,
    gridLoadedStart.value,
    selected,
  )
  const end = maxDate(
    addMonths(todayMonth, 13),
    loadedEnd.value,
    gridLoadedEnd.value,
    addMonths(selected, 1),
  )

  return monthsBetween(start, end).map((date) => ({
    value: toMonthKey(date),
    label: monthLabel(date),
  }))
})

const shiftsByDay = computed(() => {
  const groupedShifts = new Map<string, ShiftWithRelations[]>()

  shiftStore.shifts.forEach((shift) => {
    const dayKey = toDateKey(shift.date)
    const dayShifts = groupedShifts.get(dayKey) ?? []
    dayShifts.push(shift)
    groupedShifts.set(dayKey, dayShifts)
  })

  return groupedShifts
})

const selectedGridDayShifts = computed(() =>
  selectedGridDay.value ? (shiftsByDay.value.get(selectedGridDay.value) ?? []) : [],
)

const selectedGridDayLabel = computed(() => selectedDayLabel(selectedGridDay.value))

function minDate(...dates: Date[]) {
  return new Date(Math.min(...dates.map((date) => date.getTime())))
}

function maxDate(...dates: Date[]) {
  return new Date(Math.max(...dates.map((date) => date.getTime())))
}

async function fetchMonth(monthStart: Date) {
  const monthEnd = addMonths(monthStart, 1)

  await shiftStore.getShifts(undefined, {
    startDate: toDateKey(monthStart),
    endDate: toDateKey(monthEnd),
    merge: true,
  })
}

function isMonthLoaded(
  monthStart: Date,
  monthEnd: Date,
  start: Date,
  end: Date,
  requireFullMonth: boolean,
) {
  return requireFullMonth
    ? monthStart >= start && monthEnd <= end
    : monthStart >= start && monthStart < end
}

async function ensureFeedMonth(monthKey: string, requireFullMonth = false) {
  const month = parseMonthKey(monthKey)
  if (!month) return false

  const monthStart = startOfMonth(month)
  const monthEnd = addMonths(monthStart, 1)

  if (isMonthLoaded(monthStart, monthEnd, loadedStart.value, loadedEnd.value, requireFullMonth)) {
    return true
  }

  isLoadingNext.value = true
  try {
    await fetchMonth(monthStart)
    loadedStart.value = monthStart
    loadedEnd.value = monthEnd
    return true
  } finally {
    isLoadingNext.value = false
  }
}

async function ensureGridMonth(monthKey: string) {
  const month = parseMonthKey(monthKey)
  if (!month) return false

  const monthStart = startOfMonth(month)
  const monthEnd = addMonths(monthStart, 1)

  if (isMonthLoaded(monthStart, monthEnd, gridLoadedStart.value, gridLoadedEnd.value, true)) {
    return true
  }

  isLoadingNext.value = true
  try {
    await fetchMonth(monthStart)
    gridLoadedStart.value = monthStart
    gridLoadedEnd.value = monthEnd
    return true
  } finally {
    isLoadingNext.value = false
  }
}

async function loadMonth(month: Date, direction: 'previous' | 'next', target: 'feed' | 'grid') {
  const monthStart = startOfMonth(month)
  const monthEnd = addMonths(monthStart, 1)
  const loading = direction === 'previous' ? isLoadingPrevious : isLoadingNext
  if (loading.value) return
  loading.value = true

  try {
    await fetchMonth(monthStart)

    if (target === 'feed') {
      if (direction === 'previous') loadedStart.value = monthStart
      else loadedEnd.value = monthEnd
      return
    }

    if (direction === 'previous') gridLoadedStart.value = monthStart
    else gridLoadedEnd.value = monthEnd
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
    await loadMonth(addMonths(currentMonthStart, -1), 'previous', 'feed')
  }

  await nextTick()
  const newTop = previousSentinel.value?.getBoundingClientRect().top ?? oldTop
  window.scrollBy({ top: newTop - oldTop })
}

async function loadNextMonth() {
  await loadMonth(loadedEnd.value, 'next', 'feed')
}

async function loadPreviousGridMonth() {
  const oldTop = gridPreviousSentinel.value?.getBoundingClientRect().top ?? 0
  await loadMonth(addMonths(gridLoadedStart.value, -1), 'previous', 'grid')
  await nextTick()
  const newTop = gridPreviousSentinel.value?.getBoundingClientRect().top ?? oldTop
  window.scrollBy({ top: newTop - oldTop })
}

async function loadNextGridMonth() {
  await loadMonth(gridLoadedEnd.value, 'next', 'grid')
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

async function scrollToElement(elementId: string, behavior: ScrollBehavior = 'smooth') {
  await nextTick()
  const element = document.getElementById(elementId)
  if (!element) return

  const heading = scheduleRoot.value?.querySelector<HTMLElement>('.mobile-schedule__heading')
  const offset = (heading?.getBoundingClientRect().height ?? 0) + 8
  const top = element.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior })
}

async function scrollToDay(dayKey: string) {
  await scrollToElement(`mobile-day-${dayKey}`)
}

async function scrollToGridMonth(monthKey: string) {
  await scrollToElement(`mobile-grid-month-${monthKey}`)
}

async function goToMonth(monthKey: string) {
  if (!parseMonthKey(monthKey)) return
  selectedMonth.value = monthKey

  if (viewMode.value === 'grid') {
    if (await ensureGridMonth(monthKey)) {
      await scrollToGridMonth(monthKey)
    }
    return
  }

  if (await ensureFeedMonth(monthKey, true)) {
    await scrollToDay(`${monthKey}-01`)
  }
}

async function scrollToToday() {
  const todayMonth = toMonthKey(startOfToday())

  if (selectedMonth.value !== todayMonth) {
    await goToMonth(todayMonth)
    return
  }

  await scrollToDay(todayKey)
}

async function setViewMode(mode: MobileScheduleViewMode) {
  if (mode === viewMode.value) return

  const monthKey = selectedMonth.value
  isProgrammaticScroll = true

  try {
    if (mode === 'grid') {
      await ensureGridMonth(monthKey)
      viewMode.value = mode
      await nextTick()
      await scrollToElement(`mobile-grid-month-${monthKey}`, 'auto')
      return
    }

    await ensureFeedMonth(monthKey, true)
    viewMode.value = mode
    await nextTick()
    await scrollToElement(`mobile-day-${monthKey}-01`, 'auto')
  } finally {
    lastScrollY = window.scrollY
    scrollDirection.value = null
    isProgrammaticScroll = false
  }
}

function openGridDay(dayKey: string) {
  selectedGridDay.value = dayKey
}

function closeGridDay() {
  selectedGridDay.value = null
}

function addShiftFromGridDay() {
  if (!selectedGridDay.value) return
  const dayKey = selectedGridDay.value
  closeGridDay()
  emit('add-shift', dayKey)
}

async function deleteShift(shiftId: string) {
  if (!confirm($t('ui.shiftDeleteConfirm') as string)) return
  await shiftStore.deleteShift(shiftId)
}

function updateVisibleMonth() {
  const heading = scheduleRoot.value?.querySelector<HTMLElement>('.mobile-schedule__heading')
  const headingBottom = heading?.getBoundingClientRect().bottom ?? 0
  const visibleItem = Array.from(
    scheduleRoot.value?.querySelectorAll<HTMLElement>(
      '.mobile-schedule__day, .mobile-schedule__grid-month',
    ) ?? [],
  ).find((item) => item.getBoundingClientRect().bottom > headingBottom + 4)

  if (!visibleItem) return

  selectedMonth.value = visibleItem.classList.contains('mobile-schedule__grid-month')
    ? visibleItem.id.replace('mobile-grid-month-', '')
    : visibleItem.id.replace('mobile-day-', '').slice(0, 7)
}

function observeSentinels() {
  if (!observer) return

  observer.disconnect()
  previousSentinelInView.value = false
  nextSentinelInView.value = false
  gridPreviousSentinelInView.value = false
  gridNextSentinelInView.value = false

  if (viewMode.value === 'feed') {
    if (previousSentinel.value) observer.observe(previousSentinel.value)
    if (nextSentinel.value) observer.observe(nextSentinel.value)
    return
  }

  if (gridPreviousSentinel.value) observer.observe(gridPreviousSentinel.value)
  if (gridNextSentinel.value) observer.observe(gridNextSentinel.value)
}

function handleSentinelEntry(
  entry: IntersectionObserverEntry,
  sentinel: Ref<HTMLElement | null>,
  inView: Ref<boolean>,
  canLoad: () => boolean,
  load: () => Promise<void>,
) {
  if (entry.target !== sentinel.value) return

  if (!entry.isIntersecting) {
    inView.value = false
    return
  }

  if (inView.value || !canLoad()) return

  inView.value = true
  void load()
}

function markScheduleScroll() {
  const currentScrollY = window.scrollY

  if (!isProgrammaticScroll && currentScrollY !== lastScrollY) {
    scrollDirection.value = currentScrollY > lastScrollY ? 'down' : 'up'
    if (scrollDirection.value === 'down') hasScrolledDown[viewMode.value] = true
  }

  lastScrollY = currentScrollY
  updateVisibleMonth()
}

onMounted(async () => {
  if (!window.matchMedia('(max-width: 767px)').matches) return

  await loadInitialMonth()
  lastScrollY = window.scrollY
  window.addEventListener('scroll', markScheduleScroll, { passive: true })
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        handleSentinelEntry(
          entry,
          previousSentinel,
          previousSentinelInView,
          () => hasScrolledDown.feed && scrollDirection.value === 'up' && viewMode.value === 'feed',
          loadPreviousMonth,
        )
        handleSentinelEntry(entry, nextSentinel, nextSentinelInView, () => true, loadNextMonth)
        handleSentinelEntry(
          entry,
          gridPreviousSentinel,
          gridPreviousSentinelInView,
          () => hasScrolledDown.grid && scrollDirection.value === 'up' && viewMode.value === 'grid',
          loadPreviousGridMonth,
        )
        handleSentinelEntry(
          entry,
          gridNextSentinel,
          gridNextSentinelInView,
          () => true,
          loadNextGridMonth,
        )
      })
    },
    { rootMargin: '0px 0px 500px 0px' },
  )
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
  window.removeEventListener('scroll', markScheduleScroll)
})
</script>

<template>
  <section
    ref="scheduleRoot"
    class="mobile-schedule w-full min-w-0 pt-1 pb-6"
    aria-label="Mobile schedule"
  >
    <MobileScheduleToolbar
      :month-options="monthOptions"
      :selected-month="selectedMonth"
      :view-mode="viewMode"
      @select-month="goToMonth"
      @set-view-mode="setViewMode"
      @today="scrollToToday"
    />

    <template v-if="viewMode === 'feed'">
      <div
        ref="previousSentinel"
        class="flex min-h-6 items-center justify-center"
        aria-hidden="true"
      >
        <span v-if="isLoadingPrevious" class="text-xs text-[var(--text-muted)]">{{
          $t('ui.loading')
        }}</span>
      </div>

      <MobileScheduleFeed
        :days="days"
        :is-manager="props.isManager"
        :shifts-by-day="shiftsByDay"
        :today-key="todayKey"
        @add-shift="emit('add-shift', $event)"
        @delete-shift="deleteShift"
      />

      <div ref="nextSentinel" class="flex min-h-6 items-center justify-center" aria-live="polite">
        <span v-if="isLoadingNext" class="text-xs text-[var(--text-muted)]">{{
          $t('ui.loading')
        }}</span>
      </div>
    </template>

    <template v-else>
      <div
        ref="gridPreviousSentinel"
        class="flex min-h-6 items-center justify-center"
        aria-hidden="true"
      >
        <span v-if="isLoadingPrevious" class="text-xs text-[var(--text-muted)]">{{
          $t('ui.loading')
        }}</span>
      </div>

      <MobileScheduleGrid
        :is-manager="props.isManager"
        :months="gridMonthSections"
        :shifts-by-day="shiftsByDay"
        :today-key="todayKey"
        @add-shift="emit('add-shift', $event)"
        @open-day="openGridDay"
      />

      <div
        ref="gridNextSentinel"
        class="flex min-h-6 items-center justify-center"
        aria-live="polite"
      >
        <span v-if="isLoadingNext" class="text-xs text-[var(--text-muted)]">{{
          $t('ui.loading')
        }}</span>
      </div>
    </template>

    <MobileScheduleDayModal
      :model-value="Boolean(selectedGridDay)"
      :is-manager="props.isManager"
      :label="selectedGridDayLabel"
      :shifts="selectedGridDayShifts"
      @update:model-value="(value) => !value && closeGridDay()"
      @add-shift="addShiftFromGridDay"
      @delete-shift="deleteShift"
    />
  </section>
</template>
