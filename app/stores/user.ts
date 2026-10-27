import { defineStore } from 'pinia'
import { useOrganizationStore } from '~/stores/organization'
import type { User, UserWithRole } from '~~/types/user'

type RequestError = {
  data?: { message?: string }
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
  const organizationUsers = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const organizationStore = useOrganizationStore()

  async function getOrganizationUsers() {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      organizationUsers.value = await $fetch<User[]>('/api/user', {
        credentials: 'include',
        headers,
        method: 'GET',
        query: {
          organizationId: organizationStore.currentOrganizationId,
        },
      })

      return organizationUsers
    } catch (e) {
      error.value = String(e)
      console.log(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function getUserWithRole(userId: string) {
    isLoading.value = true
    error.value = null
    const organizationId = organizationStore.currentOrganizationId
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      const userWithRole = await $fetch<UserWithRole>('/api/user/role', {
        credentials: 'include',
        headers,
        method: 'GET',
        query: {
          userId,
          organizationId,
        },
      })

      return userWithRole
    } catch (e) {
      error.value = String(e)
      console.log(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function appointAdmin(userId: string) {
    isLoading.value = true
    error.value = null
    const organizationId = organizationStore.currentOrganizationId
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      await $fetch('/api/user/role', {
        credentials: 'include',
        headers,
        method: 'PATCH',
        body: {
          userId,
          role: 'admin',
        },
        query: {
          organizationId,
        },
      })

      return true
    } catch (e) {
      error.value = String(e)
      console.log(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function disAppointAdmin(userId: string) {
    isLoading.value = true
    error.value = null
    const organizationId = organizationStore.currentOrganizationId
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      await $fetch('/api/user/role', {
        credentials: 'include',
        headers,
        method: 'PATCH',
        body: {
          userId,
          role: 'user',
        },
        query: {
          organizationId,
        },
      })

      return true
    } catch (e) {
      error.value = String(e)
      console.log(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const organizationOptions = computed(() =>
    organizationUsers.value.map((ou) => ({ value: ou.id, label: ou.name })),
  )

  return {
    isLoading,
    error,
    organizationOptions,
    organizationUsers,
    getOrganizationUsers,
    getUserWithRole,
    appointAdmin,
    disAppointAdmin,
  }
})
