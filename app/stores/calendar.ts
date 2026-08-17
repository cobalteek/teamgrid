import { defineStore } from "pinia"
import type { Shift } from "@@/types/shift"

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.candidate.loadCandidates')
  }

  const requestError = error as RequestError

  return requestError.data?.message ?? requestError.message ?? $t('error.candidate.loadCandidates')
}


export const useCalendarStore = defineStore('calendar', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const firstDay = ref(1)
  const initialView = ref<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth')
  const shifts = ref<Shift[]>([])

  function setFirstDay(day: number) {
    firstDay.value = day

    if (import.meta.client) {
      localStorage.setItem('teamgrid-calendar-first-day', String(day))
    }
  }

  function setInitialView(newView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') {
    initialView.value = newView
  }

  function loadSettings() {
    if (!import.meta.client) return

    const saved = localStorage.getItem('teamgrid-calendar-first-day')

    if (saved !== null) {
      firstDay.value = Number(saved)
    }
  }

  async function getShifts() {
    isLoading.value = true
    error.value = null

    try {
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    
          shifts.value = await $fetch<Shift[]>('/api/user/shift', {
            credentials: 'include',
            method: 'GET',
            headers,
          })
    
          return shifts.value
        } catch (e: unknown) {
          error.value = getErrorMessage(e)
          throw e
        } finally {
          isLoading.value = false
        }
    }

    async function addShift(shiftData: Omit<Shift, 'id'>) {
      isLoading.value = true
      error.value = null

      try {
        const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

        const newShift = await $fetch<Shift>('/api/user/shift', {
          credentials: 'include',
          method: 'POST',
          headers,
          body: shiftData
        })

        shifts.value.push(newShift)
        
        return newShift
      } catch (e: unknown) {
        error.value = getErrorMessage(e)
        throw e
      }
    }

  return {
    firstDay,
    setFirstDay,
    loadSettings,
    initialView,
    setInitialView,
    shifts,
    getShifts,
    addShift,
    isLoading,
    error
  }
})