export function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPassword(value: string) {
  return value.length >= 8 && value.length <= 128
}

export function isValidName(value: string) {
  return value.length >= 2 && value.length <= 80
}
