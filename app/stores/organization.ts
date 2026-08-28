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

    async function initialize() {
        if (organizations.value.length > 0) return

        await getOrganizations()
    }

    async function getOrganizations() {
        isLoading.value = true
        error.value = null

        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        
            organizations.value = await $fetch<Organization[]>('/api/organization', {
                credentials: 'include',
                method: 'GET',
                headers
            })

            if(import.meta.client) {
                const savedId = localStorage.getItem('currentOrganizationId')
                if (savedId) {
                    currentOrganization.value =
                    organizations.value.find(org => org.id === Number(savedId))
                    ?? organizations.value[0]
                    ?? null
                } else {
                currentOrganization.value = organizations.value[0] ?? null
                }
            }
        
            return organizations.value
        } catch (e: unknown) {
            error.value = getErrorMessage(e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    async function createOrganization(name: string) {
        isLoading.value = true
        error.value = null
        
        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
        
            const newOrganization = await $fetch<Organization>('/api/organization', {
                credentials: 'include',
                method: 'POST',
                headers,
                body: {
                    name
                }
            })

            organizations.value.push(newOrganization)

        } catch (e: unknown) {
            error.value = getErrorMessage(e)
            throw e
        } finally {
            await getOrganizations()
            isLoading.value = false
        }
    }

    async function changeName(name: string) {
        isLoading.value = true
        error.value = null
        if(!isValidName) {
            createError({
                statusCode: 400,
                statusMessage: 'error.invalidName'
            })
            console.log(error)
        }
        try {
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

            const organization = currentOrganization

            organization.value = await $fetch<Organization>('/api/organization', {
                credentials: 'include',
                method: 'PATCH',
                headers,
                body: {
                    name
                },
                query: {
                    organizationId: currentOrganizationId.value
                }
            })
        } catch (e) {
            console.log(e)
            throw e
        }
        finally {
            await getOrganizations()
            isLoading.value = false
        }
    }

    async function changeOrganization(organization: Organization) {
        isLoading.value = true
        error.value = null
        if(organization.id <= 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid organization ID'
            })
        }

        currentOrganization.value = organization

        localStorage.setItem(
            'currentOrganizationId',
            String(organization.id)
        )

        try{
            const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

            const id = organization.id

            const owneredOrganization = await $fetch<Organization>('/api/organization', {
                credentials: 'include',
                method: 'GET',
                headers,
                query: {
                    id
                }
            })

            if(!owneredOrganization) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'error.organization.notFound.notOwner'
                })
            }

            currentOrganization.value = organization
            localStorage.setItem('currentOrganizationId', String(organization.id))


        } catch (e) {
            console.error(e)
            error.value = String(e)
            throw e
        } finally {
            await getOrganizations()
            isLoading.value = false
        }
    }

    const options = computed(() =>
        [...organizations.value]
            .sort((a, b) => {
                if (a.id === currentOrganization.value?.id) return -1
                if (b.id === currentOrganization.value?.id) return 1
                return 0
            })
            .map(p => ({
                value: p.id,
                label: p.name
            }))
    )

    return {
        error,
        isLoading,
        organizations,
        getOrganizations,
        createOrganization,
        currentOrganization,
        currentOrganizationId,
        options,
        initialize,
        changeName,
        changeOrganization
    }
})