import { useOrganizationStore } from '~/stores/organization'
import { useEmployeeStore } from '~/stores/employee'
import { usePositionStore } from '~/stores/position'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'
import { useUserSettingsStore } from '~/stores/userSettings'

export function useInitializeApp() {
  const organizationStore = useOrganizationStore()
  const employeeStore = useEmployeeStore()
  const positionStore = usePositionStore()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const userSettingsStore = useUserSettingsStore()
  const { setLocale } = useI18n()
  const shiftStore = useShiftStore()
  async function init() {
    await authStore.init()
    if (!authStore.isAuthed) {
      return
    }
    const userSettings = await userSettingsStore.getSettings()
    await setLocale(userSettings.locale)
    await organizationStore.getOrganizations()
    await Promise.all([
      shiftStore.getShifts(),
      employeeStore.getEmployees(),
      positionStore.getPositions(),
      userStore.getOrganizationUsers(),
    ])
  }
  return {
    init,
  }
}
