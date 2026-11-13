import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRequestHeaders } from '#imports'
import type { Organization, OrganizationAccess, OrganizationRole } from '~~/types/organization'

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.organization.notFound')
  }

  const requestError = error as RequestError
  return requestError.data?.message ?? requestError.message ?? $t('error.organization.notFound')
}

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<OrganizationAccess[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentOrganization = ref<OrganizationAccess | null>(null)

  const currentOrganizationId = computed(() => currentOrganization.value?.id ?? null)
  const currentRole = computed(() => currentOrganization.value?.role ?? null)
  const isOwner = computed(() => currentOrganization.value?.isOwner === true)
  const isManager = computed(() => currentOrganization.value?.isManager === true)

  async function initialize() {
    if (organizations.value.length > 0) return

    await getOrganizations()
  }

  async function getOrganizations() {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      organizations.value = await $fetch<OrganizationAccess[]>('/api/organization', {
        credentials: 'include',
        method: 'GET',
        headers,
      })

      const savedId = import.meta.client ? localStorage.getItem('currentOrganizationId') : null
      currentOrganization.value =
        organizations.value.find((organization) => organization.id === Number(savedId)) ??
        organizations.value[0] ??
        null

      return organizations.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createOrganization(name: string, description: string) {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      await $fetch<Organization>('/api/organization', {
        credentials: 'include',
        method: 'POST',
        headers,
        body: {
          name,
          description,
        },
      })

      await getOrganizations()
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function changeName(name: string) {
    if (!isValidName(name)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'error.invalidName',
      })
    }

    if (!currentOrganizationId.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'error.organization.notFound',
      })
    }

    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      await $fetch<Organization>('/api/organization', {
        credentials: 'include',
        method: 'PATCH',
        headers,
        body: { name },
        query: {
          organizationId: currentOrganizationId.value,
        },
      })

      await getOrganizations()
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function changeDescription(description: string) {
    if (!currentOrganization.value || !currentOrganizationId.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'error.organization.notFound',
      })
    }

    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      await $fetch<Organization>('/api/organization', {
        credentials: 'include',
        method: 'PATCH',
        headers,
        body: {
          name: currentOrganization.value.name,
          description,
        },
        query: {
          organizationId: currentOrganizationId.value,
        },
      })

      await getOrganizations()
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function changeOrganization(organization: Organization) {
    if (organization.id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'error.organization.invalidId',
      })
    }

    const access = organizations.value.find((item) => item.id === organization.id)

    if (!access) {
      throw createError({
        statusCode: 403,
        statusMessage: 'error.organization.notFound',
      })
    }

    currentOrganization.value = access

    if (import.meta.client) {
      localStorage.setItem('currentOrganizationId', String(access.id))
    }
  }

  function hasRole(roles: readonly OrganizationRole[]) {
    return currentRole.value !== null && roles.includes(currentRole.value)
  }

  const options = computed(() =>
    [...organizations.value]
      .sort((a, b) => {
        if (a.id === currentOrganization.value?.id) return -1
        if (b.id === currentOrganization.value?.id) return 1
        return 0
      })
      .map((organization) => ({
        value: organization.id,
        label: organization.name,
      })),
  )

  const optionsWithDescription = computed(() =>
    [...organizations.value]
      .sort((a, b) => {
        if (a.id === currentOrganization.value?.id) return -1
        if (b.id === currentOrganization.value?.id) return 1
        return 0
      })
      .map((organization) => ({
        value: organization.id,
        label: organization.name,
        description: organization.description,
      })),
  )

  return {
    error,
    isLoading,
    organizations,
    getOrganizations,
    createOrganization,
    currentOrganization,
    currentOrganizationId,
    currentRole,
    isOwner,
    isManager,
    hasRole,
    options,
    initialize,
    changeName,
    changeDescription,
    changeOrganization,
    optionsWithDescription,
  }
})
