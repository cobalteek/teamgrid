import { defineStore } from "pinia"
import type { Position } from "../../types/position"
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

export const usePositionStore = defineStore('position', () => {
    const positions = ref<Position[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function getPositions() {
        isLoading.value = true
        error.value = null
    
        try {
          const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    
          positions.value = await $fetch<Position[]>('/api/user/position', {
            credentials: 'include',
            method: 'GET',
            headers,
          })
    
          return positions.value
        } catch (e: unknown) {
          error.value = getErrorMessage(e)
          throw e
        } finally {
          isLoading.value = false
        }
      }

    const options = computed(() =>
        positions.value.map(p => ({value: p.id, label: p.name}))
    )

    return {
        positions,
        error,
        isLoading,
        getPositions,
        options
    }
})