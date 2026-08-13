import {defineStore} from 'pinia'
import type {User} from '~~/types/user'

type RequestError = {
  data?: {message?: string}
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.user.loadUsers')
  }

  const requestError = error as RequestError

  return requestError.data?.message ?? requestError.message ?? $t('error.user.loadUsers')
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function getUsers() {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      users.value = await $fetch<User[]>('/api/user', {
        credentials: 'include',
        method: 'GET',
        headers,
      })

      return users.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    isLoading,
    error,
    getUsers,
  }
})
