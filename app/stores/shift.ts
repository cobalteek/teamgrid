import { defineStore } from "pinia"
import type { CreateShift, ShiftWithRelations } from "~~/types/shift"
import { formatDateStr } from "~~/shared/utils/formatDate" 

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.shift.notFound')
  }

  const requestError = error as RequestError
<<<<<<< HEAD
  return requestError.data?.message ?? requestError.message ?? $t('error.')
=======
  return requestError.data?.message ?? requestError.message ?? $t('error.shift.notFound')
>>>>>>> develop
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
          const date = new Date(`${shiftData.date}T00:00:00Z`)
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
          const existingShift = shifts.value.find(shift => 
            formatDateStr(new Date(shift.date)) === formatDateStr(date)
            &&
            shift.employeeId === shiftData.employeeId
          )
          if (existingShift) throw createError('error.shift.duplicate')

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
            if (!Array.isArray(shiftData) || shiftData.length === 0) {
              throw createError({ statusCode: 400, statusMessage: 'error.bulk.notFound' })
            }
            
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
            
            for (const newShift of shiftData) {
              const dateUTC = new Date(`${newShift.date}T00:00:00Z`)
                const existingShift = shifts.value.find(
                  shift =>
                  formatDateStr(shift.date) ===
                  formatDateStr(dateUTC) &&
                     shift.employeeId === newShift.employeeId
                  )
              if (existingShift) throw createError({ statusCode: 409,
                statusMessage: 'error.shift.duplicate' })
              }
    
            const formattedShifts = shiftData.map(shift => ({
              ...shift,
              date: new Date(`${shift.date}T00:00:00Z`)
            }))
    
            try {
              const newShifts = await $fetch<ShiftWithRelations[]>(
                '/api/shift/bulk',
                {
                  credentials: 'include',
                  method: 'POST',
                  headers,
                  body: { shifts: formattedShifts, organizationId }
                }
              )
        
              shifts.value.push(...newShifts)
              return true
            } catch (e: unknown) {
              error.value = getErrorMessage(e)
              throw e
            }
<<<<<<< HEAD
        }
=======
      }

      async function deleteShift(shiftId: string) {
        isLoading.value = true
        error.value = null

        try {
          const deleteShift = await $fetch('/api/shift/delete', {
            credentials: 'include',
            method: 'POST',
            body: {
              id: shiftId
            }
          })
          
          return deleteShift
        } catch(e) {
          error.value = String(e)
          console.log(e)
          throw e
        } finally {
          await getShifts()
          isLoading.value = false
        }
      }
>>>>>>> develop

    return {
        shifts,
        error,
        isLoading,
        getShifts,
        createShift,
<<<<<<< HEAD
        createManyShifts
=======
        createManyShifts,
        deleteShift
>>>>>>> develop
    }
})