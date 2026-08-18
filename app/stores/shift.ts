import { defineStore } from "pinia"
import type { CreateShift, Shift } from "~~/types/shift"

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.')
  }

  const requestError = error as RequestError
  return requestError.data?.message ?? requestError.message ?? $t('error.')
}

export const useShiftStore = defineStore('shift', () => {

    const shifts = ref<Shift[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

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

      async function createShift(shiftData: Omit<CreateShift, 'id'>) {
        try {
          if (
            !shiftData.date ||
            !shiftData.employeeId ||
            !shiftData.positionId
          ) {
            throw new Error($t('validation.shift.requiredFields'))
          }
          const date = new Date(`${shiftData.date}`)
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
          const existingShift = shifts.value.find(shift => shift.date === date && shift.employeeId === shiftData.employeeId)
          if (existingShift) {
            throw new Error($t('error.shift.duplicate'))
          }

          const formattedShiftData = {
            ...shiftData,
            date
          }

          const newShift = await $fetch<Shift>('/api/user/shift', {
            credentials: 'include',
            method: 'POST',
            headers,
            body: formattedShiftData,
          })
    
          shifts.value.push(newShift)
    
          return newShift
        } catch (e: unknown) {
          error.value = getErrorMessage(e)
          throw e
        }
      }

    return {
        shifts,
        error,
        isLoading,
        getShifts,
        createShift
    }
})