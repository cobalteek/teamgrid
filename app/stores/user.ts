import {defineStore} from 'pinia'
import {useOrganizationStore} from '~/stores/organization'
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
  const organizationUsers = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const organizationStore = useOrganizationStore()

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

  async function getOrganizationUsers() {
    isLoading.value = true
    error.value = null

    try {
      organizationUsers.value = await $fetch('/api/user', {
        credentials: 'include',
        method: 'GET',
        query: {
          organizationId: organizationStore.currentOrganizationId
        }
      })

      return organizationUsers
    } catch(e) {
      error.value = String(e)
      console.log(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const options = computed(() =>
    users.value.map(u => ({value: u.id, label: u.name}))
  )

  const organizationOptions = computed(() =>
    organizationUsers.value.map(ou => ({value: ou.id, label: ou.name}))
  )

  return {
    users,
    isLoading,
    error,
    options,
    organizationOptions,
    getUsers,
    getOrganizationUsers
  }
})
