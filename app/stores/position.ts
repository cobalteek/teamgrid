import { defineStore } from "pinia"
import type { Position } from "~~/types/position"
type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.position.notFound')
  }

  const requestError = error as RequestError
  return requestError.data?.message ?? requestError.message ?? $t('error.position.notFound')
}

export const usePositionStore = defineStore('position', () => {
    const positions = ref<Position[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const organizationStore = useOrganizationStore()

    async function getPositions() {
        isLoading.value = true
        error.value = null
        const organizationId = organizationStore.currentOrganizationId
    
        try {
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
          positions.value = []
    
          positions.value = await $fetch<Position[]>('/api/position', {
            credentials: 'include',
            method: 'GET',
            headers,
            query: {
              organizationId
            }
          })
    
          return positions.value
        } catch (e: unknown) {
          error.value = getErrorMessage(e)
          throw e
        } finally {
          isLoading.value = false
        }
    }

    async function getPositionById(positionId: number) {
      isLoading.value = true
      error.value = null
      
      try {
        const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      
        const position = await $fetch<Position>('/api/position', {
          query: { positionId },
          headers
        })
      
        return position
      } catch (e: unknown) {
        error.value = getErrorMessage(e)
        throw e
      } finally {
        isLoading.value = false
      }
    }

    async function changePosition(position: Position) {
      isLoading.value = true
      error.value = null
      
      if(!position.name ||
        !position.fullName) {
        throw createError({
          statusCode: 400,
          statusMessage: 'error.position.invalidData'
        })
      }

      if(!isValidName(position.name) || !isValidName(position.fullName)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'error.position.invalidName'
        })
      }
      try {
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

          const changedPosition = await $fetch<Position>('api/position', {
            credentials: 'include',
            method: 'PATCH',
            headers,
            body: position,
            query: {
              organizationId: organizationStore.currentOrganizationId,
              positionId: position.id
            }
          })
      } catch (e: unknown) {
          error.value = getErrorMessage(e)
          throw e
      } finally {
          await getPositions()
          isLoading.value = false
      }
    }

    const options = computed(() =>
        positions.value.map(p => ({value: p.id, label: p.name}))
    )

    const optionsFull = computed(() =>
        positions.value.map(p => ({value: p.id, label: p.fullName}))
    )

    return {
        positions,
        error,
        isLoading,
        getPositions,
        getPositionById,
        changePosition,
        options,
        optionsFull
    }
})