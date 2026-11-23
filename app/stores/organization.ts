import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
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
  const requestFetch = useRequestFetch()
  const organizations = ref<OrganizationAccess[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentOrganization = ref<OrganizationAccess | null>(null)
  const currentOrganizationCookie = useCookie<string | null>('currentOrganizationId', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

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
      organizations.value = await requestFetch<OrganizationAccess[]>('/api/organization', {
        credentials: 'include',
        method: 'GET',
      })

      const savedId =
        currentOrganizationCookie.value ??
        (import.meta.client ? localStorage.getItem('currentOrganizationId') : null)
      const selectedOrganization =
        organizations.value.find((organization) => organization.id === Number(savedId)) ??
        organizations.value[0] ??
        null
      currentOrganization.value = selectedOrganization

      if (selectedOrganization && import.meta.client) {
        currentOrganizationCookie.value = String(selectedOrganization.id)
        localStorage.setItem('currentOrganizationId', String(selectedOrganization.id))
      }

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
      await requestFetch<Organization>('/api/organization', {
        credentials: 'include',
        method: 'POST',
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
      await requestFetch<Organization>('/api/organization', {
        credentials: 'include',
        method: 'PATCH',
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
      await requestFetch<Organization>('/api/organization', {
        credentials: 'include',
        method: 'PATCH',
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

    const route = useRoute()
    const isManagerPage = computed(() => route.name === 'schedule' || route.name === 'bonus')

    if (isManagerPage.value && !access.isManager) {
      navigateTo('/dashboard')
    }

    currentOrganization.value = access

    if (import.meta.client) {
      currentOrganizationCookie.value = String(access.id)
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
