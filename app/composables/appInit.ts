import { useOrganizationStore } from "~/stores/organization"
import { useShiftStore } from "~/stores/shift"
import { useEmployeeStore } from "~/stores/employee"
import { usePositionStore } from "~/stores/position"
import { useAuthStore } from "~/stores/auth"
import { useUserStore } from "~/stores/user"

export function useInitializeApp() {
  const organizationStore = useOrganizationStore()
  const shiftStore = useShiftStore()
  const employeeStore = useEmployeeStore()
  const positionStore = usePositionStore()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  async function init() {
    await authStore.init()
    await userStore.getUsers()
    await organizationStore.getOrganizations()
    await Promise.all([
        shiftStore.getShifts(),
        employeeStore.getEmployees(),
        positionStore.getPositions(),
        userStore.getOrganizationUsers()
    ])
  }
  return {
    init
  }
}