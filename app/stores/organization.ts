import type { Organization } from "../../types/organization"
import { defineStore } from "pinia"

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
    const organizations = ref<Organization[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentOrganization = ref<Organization | null>(null)

    const currentOrganizationId = computed(
    () => currentOrganization.value?.id ?? null
    )

    async function getOrganizations() {
        isLoading.value = true
        error.value = null

        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        
            organizations.value = await $fetch<Organization[]>('/api/user/organization', {
                credentials: 'include',
                method: 'GET',
                headers,
            })

            if (organizations.value.length > 0 && currentOrganization.value === null) {
                currentOrganization.value = organizations.value[0] ? organizations.value[0] : null
            }
        
            return organizations.value
        } catch (e: unknown) {
            error.value = getErrorMessage(e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    async function createOrganization(organizationName: string) {
        isLoading.value = true
        error.value = null
        
        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        
            const newOrganization = await $fetch<Organization>('/api/user/organization', {
                credentials: 'include',
                method: 'POST',
                headers,
                body: organizationName
            })

            organizations.value.push(newOrganization)

        } catch (e: unknown) {
            error.value = getErrorMessage(e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const options = computed(() =>
        organizations.value.map(p => ({value: p.id, label: p.name}))
    )

    return {
        error,
        isLoading,
        organizations,
        getOrganizations,
        createOrganization,
        currentOrganization,
        currentOrganizationId,
        options
    }
})