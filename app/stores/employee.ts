import { defineStore } from 'pinia'
import { useOrganizationStore } from '~/stores/organization'
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
  const requestFetch = useRequestFetch()
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
      employees.value = await requestFetch<Employee[]>('/api/employee', {
        credentials: 'include',
        method: 'GET',
        query: {
          organizationId,
        },
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
    isLoading.value = true
    error.value = null

    try {
      const newEmployee = await requestFetch<Employee>('/api/employee', {
        credentials: 'include',
        method: 'POST',
        body: employeeData,
      })

      employees.value.push(newEmployee)

      return newEmployee
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function getEmployeeById(userId: string) {
    isLoading.value = true
    error.value = null

    const organizationId = organizationStore.currentOrganizationId

    try {
      const employee = await requestFetch<Employee>('/api/employee', {
        query: { userId, organizationId },
      })

      return employee
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function changeEmployee(employee: Employee) {
    isLoading.value = true
    error.value = null

    try {
      const changedEmployee = await requestFetch<Employee>('/api/employee', {
        credentials: 'include',
        method: 'PATCH',
        body: employee,
      })

      return changedEmployee
    } catch (e: unknown) {
      error.value = getErrorMessage(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function reorderEmployees(employeeIds: string[]) {
    const previousEmployees = [...employees.value]
    const employeeById = new Map(employees.value.map((employee) => [employee.id, employee]))

    employees.value = employeeIds
      .map((id, sortOrder) => {
        const employee = employeeById.get(id)
        return employee ? { ...employee, sortOrder } : null
      })
      .filter((employee): employee is Employee => employee !== null)

    try {
      await requestFetch('/api/employee/reorder', {
        credentials: 'include',
        method: 'PATCH',
        body: {
          organizationId: organizationStore.currentOrganizationId,
          employeeIds,
        },
      })
    } catch (e: unknown) {
      employees.value = previousEmployees
      error.value = getErrorMessage(e)
      throw e
    }
  }

  const options = computed(() =>
    [...employees.value]
      .sort((a, b) => a.surname.localeCompare(b.surname))
      .map((e) => ({ value: e.id, label: `${e.surname} ${e.name} ${e.middlename}` })),
  )

  async function deleteEmployee(employeeId: string, withShifts: boolean) {
    isLoading.value = true
    error.value = null

    try {
      const deleteEmployee = await $fetch('/api/employee/delete', {
        credentials: 'include',
        method: 'POST',
        body: {
          id: employeeId,
          withShifts,
        },
        query: {
          organizationId: organizationStore.currentOrganizationId,
        },
      })

      return deleteEmployee
    } catch (e) {
      error.value = String(e)
      console.log(e)
      throw e
    } finally {
      await getEmployees()
      isLoading.value = false
    }
  }

  return {
    employees,
    isLoading,
    error,
    getEmployees,
    createEmployee,
    getEmployeeById,
    changeEmployee,
    reorderEmployees,
    deleteEmployee,
    options,
  }
})
