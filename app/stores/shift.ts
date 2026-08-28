import { defineStore } from "pinia"
import type { CreateShift, ShiftWithRelations } from "~~/types/shift"

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.shift.notFound')
  }

  const requestError = error as RequestError
  return requestError.data?.message ?? requestError.message ?? $t('error.')
}

export const useShiftStore = defineStore('shift', () => {
    const shifts = ref<ShiftWithRelations[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const organizationStore = useOrganizationStore()

    async function getShifts(employeeId?: string) {
        isLoading.value = true
        error.value = null

        const organizationId = organizationStore.currentOrganizationId
    
        try {
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

          if(!organizationId) {
            createError({
              statusCode: 404,
              statusMessage: 'error.organization.getId'
            })
          }
    
          shifts.value = await $fetch<ShiftWithRelations[]>('/api/shift', {
            credentials: 'include',
            method: 'GET',
            headers,
            query: {
              organizationId,
              employeeId
            }
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
        const organizationId = organizationStore.currentOrganizationId
        try {
          if (
            !shiftData.date ||
            !shiftData.employeeId ||
            !shiftData.positionId
          ) {
            throw createError('validation.shift.requiredFields')
          }
          const date = new Date(`${shiftData.date}`)
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
          const existingShift = shifts.value.find(shift => shift.date.toString().slice(0,10) === date.toLocaleDateString('sv-SE') && shift.employeeId === shiftData.employeeId)
          if (existingShift) {
            throw createError('error.shift.duplicate')
          }

          const formattedShiftData = {
            ...shiftData,
            date
          }

          const newShift = await $fetch<ShiftWithRelations>('/api/shift', {
            credentials: 'include',
            method: 'POST',
            headers,
            query: {
              organizationId
            },
            body: formattedShiftData,
          })
    
          shifts.value.push(newShift)
    
          return newShift
        } catch (e: unknown) {
          error.value = getErrorMessage(e)
          throw e
        }
      }

      async function createManyShifts(shiftData: Omit<CreateShift, 'id'>[]) {
        const organizationId = organizationStore.currentOrganizationId
        if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'error.bulk.notFound'
          })
        }
        const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        for (const newShift of shiftData) {
          const existingShift = shifts.value.find(
            shift =>
              formatDate(new Date(shift.date)) === formatDate(new Date(newShift.date)) &&
              shift.employeeId === newShift.employeeId
          )

          if (existingShift) {
            throw createError({
              statusCode: 409,
              statusMessage: 'error.shift.duplicate'
            })
          }
        }

        const formattedShifts = shiftData.map(shift => ({
          ...shift,
          date: new Date(`${shift.date}T00:00:00`)
        }))


        try {
          const newShifts = await $fetch<ShiftWithRelations[]>(
            '/api/shift/bulk',
            {
              credentials: 'include',
              method: 'POST',
              headers,
              body: {
                shifts: formattedShifts,
                organizationId
              }
            }
          )
    
          shifts.value.push(...newShifts)
    
          return newShifts
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
        createShift,
        createManyShifts
    }
})