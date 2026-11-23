import { defineStore } from 'pinia'
import { useOrganizationStore } from '~/stores/organization'
import type { CreateVacation, Vacation, VacationRange } from '~~/types/vacation'

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.vacation.notFound')
  }

  const requestError = error as RequestError
  return requestError.data?.message ?? requestError.message ?? $t('error.vacation.notFound')
}

export const useVacationStore = defineStore('vacation', () => {
  const requestFetch = useRequestFetch()
  const vacations = ref<Vacation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const organizationStore = useOrganizationStore()

  async function getVacations(range?: VacationRange) {
    isLoading.value = true
    error.value = null

    try {
      vacations.value = await requestFetch<Vacation[]>('/api/vacation', {
        credentials: 'include',
        query: {
          organizationId: organizationStore.currentOrganizationId,
          startDate: range?.startDate,
          endDate: range?.endDate,
        },
      })

      return vacations.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createVacation(vacation: CreateVacation) {
    isLoading.value = true
    error.value = null

    try {
      const createdVacation = await requestFetch<Vacation>('/api/vacation', {
        credentials: 'include',
        method: 'POST',
        query: { organizationId: organizationStore.currentOrganizationId },
        body: vacation,
      })

      vacations.value.push(createdVacation)
      return createdVacation
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteVacation(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await $fetch('/api/vacation/delete', {
        credentials: 'include',
        method: 'POST',
        query: { organizationId: organizationStore.currentOrganizationId },
        body: { id },
      })
      vacations.value = vacations.value.filter((vacation) => vacation.id !== id)
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { vacations, isLoading, error, getVacations, createVacation, deleteVacation }
})
