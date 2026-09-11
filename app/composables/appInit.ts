import { useOrganizationStore } from "~/stores/organization"
import { useEmployeeStore } from "~/stores/employee"
import { usePositionStore } from "~/stores/position"
import { useAuthStore } from "~/stores/auth"
import { useUserStore } from "~/stores/user"

export function useInitializeApp() {
  const organizationStore = useOrganizationStore()
  const employeeStore = useEmployeeStore()
  const positionStore = usePositionStore()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  async function init() {
    await authStore.init()

    if (!authStore.isAuthed) {
      return
    }

    await organizationStore.getOrganizations()
    await Promise.all([
        employeeStore.getEmployees(),
        positionStore.getPositions(),
        userStore.getOrganizationUsers()
    ])
  }
  return {
    init
  }
}
