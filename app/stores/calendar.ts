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

  return {
    firstDay,
    setFirstDay,
    loadSettings,
    initialView,
    setInitialView,
    isLoading,
    error
  }
})