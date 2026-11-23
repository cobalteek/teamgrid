import type { ComputedRef, Ref } from 'vue'
import type { ScheduleDay } from '~~/types/schedule'
import { isRussianFiveTwoHoliday as isRussianHoliday } from '~~/shared/utils/russianHolidays'

type ScheduleCalendarOptions = {
  localeCode: ComputedRef<string>
  excludeRussianFiveTwoHolidays: Ref<boolean> | ComputedRef<boolean>
}

export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function useScheduleCalendar({
  localeCode,
  excludeRussianFiveTwoHolidays,
}: ScheduleCalendarOptions) {
  const monthCursor = ref(startOfMonth(new Date()))
  const todayKey = localDateKey(new Date())

  const monthTitle = computed(() => {
    const title = monthCursor.value.toLocaleDateString(localeCode.value, {
      month: 'long',
      year: 'numeric',
    })

    return title.charAt(0).toUpperCase() + title.slice(1)
  })

  const monthDays = computed<ScheduleDay[]>(() => {
    const monthStart = startOfMonth(monthCursor.value)
    const monthEnd = endOfMonth(monthCursor.value)
    const days: ScheduleDay[] = []

    for (let day = 1; day <= monthEnd.getDate(); day += 1) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)

      days.push({
        key: localDateKey(date),
        date,
        weekday: date.toLocaleDateString(localeCode.value, { weekday: 'short' }),
        number: String(day),
        isToday: localDateKey(date) === todayKey,
        isHoliday: excludeRussianFiveTwoHolidays.value && isRussianHoliday(date),
      })
    }

    return days
  })

  const monthStartKey = computed(() => localDateKey(startOfMonth(monthCursor.value)))
  const monthEndKey = computed(() => localDateKey(endOfMonth(monthCursor.value)))

  function moveMonth(offset: number) {
    monthCursor.value = new Date(
      monthCursor.value.getFullYear(),
      monthCursor.value.getMonth() + offset,
      1,
    )
  }

  function goToToday() {
    monthCursor.value = startOfMonth(new Date())
  }

  return {
    goToToday,
    monthDays,
    monthEndKey,
    monthStartKey,
    monthTitle,
    moveMonth,
  }
}
