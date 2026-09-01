import { defineStore } from 'pinia'
import type { CreateEmployee, Employee } from '~~/types/employee'

type RequestError = {
  data?: { message?: string }
  message?: string
}

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return $t('error.candidate.loadEmployee')
  }

  const requestError = error as RequestError

  return requestError.data?.message ?? requestError.message ?? $t('error.candidate.loadCandidates')
}

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const organizationStore = useOrganizationStore()

  async function getEmployees() {
    isLoading.value = true
    error.value = null
    const organizationId = organizationStore.currentOrganizationId

    try {
      employees.value = []
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      employees.value = await $fetch<Employee[]>('/api/employee', {
        credentials: 'include',
        method: 'GET',
        headers,
        query: {
          organizationId
        }
      })

      return employees.value
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createEmployee(employeeData: Omit<CreateEmployee, 'id'>) {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      const newEmployee = await $fetch<Employee>('/api/employee', {
        credentials: 'include',
        method: 'POST',
        headers,
        body: employeeData
      })

      employees.value.push(newEmployee)

      return newEmployee
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    }
  }

  async function getEmployeeById(employeeId:string) {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      const employee = await $fetch<Employee>('/api/employee', {
        query: { employeeId },
        headers
      })

      return employee
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function changeEmployee(employee:Employee) {
    isLoading.value = true
    error.value = null

    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      const changedEmployee = await $fetch<Employee>('/api/employee', {
        credentials: 'include',
        method: 'PATCH',
        body: employee,
        headers
      })

      return changedEmployee
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const options = computed(() =>
    employees.value.map(e => ({value: e.id, label: `${e.surname} ${e.name} ${e.middlename}`}))
  )

  return {
    employees,
    isLoading,
    error,
    getEmployees,
    createEmployee,
    getEmployeeById,
    changeEmployee,
    options
  }
})