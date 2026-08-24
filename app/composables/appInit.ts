const organizationStore = useOrganizationStore()
const shiftStore = useShiftStore()
const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()

export async function initializeApp() {
  await organizationStore.getOrganizations(),
    await Promise.all([
        shiftStore.getShifts(organizationStore.currentOrganization?.id),
        employeeStore.getEmployees(),
        positionStore.getPositions()
    ])
}