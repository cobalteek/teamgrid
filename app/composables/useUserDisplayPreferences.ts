import { storeToRefs } from 'pinia'
import { useUserSettingsStore } from '~/stores/userSettings'

export function useUserDisplayPreferences() {
  const userSettingsStore = useUserSettingsStore()
  const { settings } = storeToRefs(userSettingsStore)

  function formatTime(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const restMinutes = String(minutes % 60).padStart(2, '0')

    if (settings.value.timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${restMinutes} ${period}`
    }

    return `${String(hours).padStart(2, '0')}:${restMinutes}`
  }

  function formatDate(value: Date | string | number) {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return settings.value.dateFormat === 'mdy'
      ? `${month}/${day}/${year}`
      : `${day}.${month}.${year}`
  }

  function formatDateInput(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return value

    const [, year, month, day] = match
    return settings.value.dateFormat === 'mdy'
      ? `${month}/${day}/${year}`
      : `${day}.${month}.${year}`
  }

  function parseDateInput(value: string) {
    const normalized = value.trim()
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)
    const displayMatch = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(normalized)

    if (!isoMatch && !displayMatch) return null

    const first = isoMatch?.[1] ?? displayMatch?.[1]
    const second = isoMatch?.[2] ?? displayMatch?.[2]
    const third = isoMatch?.[3] ?? displayMatch?.[3]
    if (!first || !second || !third) return null

    const year = Number(isoMatch ? first : third)
    const month = Number(isoMatch ? second : settings.value.dateFormat === 'mdy' ? first : second)
    const day = Number(isoMatch ? third : settings.value.dateFormat === 'mdy' ? second : first)

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null

    const date = new Date(Date.UTC(year, month - 1, day))
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function canonicalTimeToDisplay(value: string) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value)
    if (!match) return value

    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours > 23 || minutes > 59) return value

    return formatTime(hours * 60 + minutes)
  }

  function parseTimeInput(value: string) {
    const match = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)?$/i.exec(value.trim())
    if (!match) return null

    let hours = Number(match[1])
    const minutes = Number(match[2])
    const period = match[3]?.toUpperCase()

    if (settings.value.timeFormat === '12h' && period) {
      if (hours < 1 || hours > 12) return null
      hours = (hours % 12) + (period === 'PM' ? 12 : 0)
    } else if (hours > 23) {
      return null
    }

    return hours * 60 + minutes
  }

  function minutesToCanonicalTime(minutes: number) {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  }

  return {
    settings,
    canonicalTimeToDisplay,
    formatDate,
    formatDateInput,
    formatTime,
    minutesToCanonicalTime,
    parseDateInput,
    parseTimeInput,
  }
}
