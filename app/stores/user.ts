import { defineStore } from 'pinia'
import { useOrganizationStore } from '~/stores/organization'
import type { User, UserWithRole } from '~~/types/user'

export const useUserStore = defineStore('user', () => {
  const requestFetch = useRequestFetch()
  const organizationUsers = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const organizationStore = useOrganizationStore()

  async function getOrganizationUsers() {
    isLoading.value = true
    error.value = null

    try {
      organizationUsers.value = await requestFetch<User[]>('/api/user', {
        credentials: 'include',
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
      const userWithRole = await requestFetch<UserWithRole>('/api/user/role', {
        credentials: 'include',
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
      await requestFetch('/api/user/role', {
        credentials: 'include',
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
      await requestFetch('/api/user/role', {
        credentials: 'include',
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
