import type { Ref } from 'vue'

export type MobileScheduleViewMode = 'feed' | 'grid'

export type MobileScheduleDay = {
  key: string
  date: Date
  weekday: string
  number: number
  month: string
}

export type MobileScheduleGridDay = {
  key: string
  date: Date
  number: number
  weekday: string
}

export type MobileScheduleGridMonth = {
  key: string
  label: string
  days: Array<MobileScheduleGridDay | null>
}

function localeCode(locale: string) {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}

export function useMobileScheduleDates(locale: Ref<string>) {
  function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

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

  function addDays(date: Date, amount: number) {
    const result = new Date(date)
    result.setUTCDate(result.getUTCDate() + amount)
    return result
  }

  function toMonthKey(date: Date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  }

  function parseMonthKey(monthKey: string) {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return null
    const date = new Date(`${monthKey}-01T00:00:00Z`)
    return Number.isNaN(date.getTime()) ? null : date
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

  function monthLabel(date: Date) {
    const label = new Intl.DateTimeFormat(localeCode(locale.value), {
      month: 'long',
      year: 'numeric',
    })
      .format(date)
      .replace(' г.', '')

    return capitalize(label)
  }

  function selectedDayLabel(dayKey: string | null) {
    if (!dayKey) return ''

    const date = new Date(`${dayKey}T00:00:00Z`)
    const label = new Intl.DateTimeFormat(localeCode(locale.value), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
      .format(date)
      .replace(' г.', '')

    return capitalize(label)
  }

  function feedDay(date: Date): MobileScheduleDay {
    return {
      key: toDateKey(date),
      date,
      weekday: new Intl.DateTimeFormat(localeCode(locale.value), { weekday: 'short' })
        .format(date)
        .replace('.', ''),
      number: date.getUTCDate(),
      month: new Intl.DateTimeFormat(localeCode(locale.value), { month: 'short' })
        .format(date)
        .replace('.', ''),
    }
  }

  function gridDaysForMonth(monthStart: Date) {
    const offset = (monthStart.getUTCDay() + 6) % 7

    return [
      ...Array.from({ length: offset }, () => null),
      ...daysBetween(monthStart, addMonths(monthStart, 1)).map(({ key, date }) => ({
        key,
        date,
        number: date.getUTCDate(),
        weekday: new Intl.DateTimeFormat(localeCode(locale.value), { weekday: 'short' })
          .format(date)
          .replace('.', '')
          .replace(/^./, (letter) => letter.toUpperCase()),
      })),
    ]
  }

  return {
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
    capitalize,
  }
}
