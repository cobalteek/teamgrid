import {useOrganizationStore} from '~/stores/organization'

export function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPassword(value: string) {
  return value.length >= 8 && value.length <= 128
}

export function isValidName(value: string) {
  return value.length >= 2 && value.length <= 80
}

export function isValidPosition(value: string) {
  return value.length >= 1 && value.length <= 128
}

export async function checkManagerStatus() {
  const organizationStore = useOrganizationStore()
  try {
    const result = await organizationStore.isManager()
    return Boolean(result)
  } catch (error) {
    console.log(error)
    return false
  }
}