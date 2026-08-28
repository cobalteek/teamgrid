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
    await organizationStore.getOrganizations(),
    await Promise.all([
        shiftStore.getShifts(),
        employeeStore.getEmployees(),
        positionStore.getPositions()
    ])
  }
  return {
    init
  }
}