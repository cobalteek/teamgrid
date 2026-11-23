export const salaryTypes = ['hourly', 'per_shift', 'monthly'] as const

export type SalaryType = (typeof salaryTypes)[number]
export type SalaryFormType = SalaryType | 'none' | 'inherit'

export function isSalaryType(value: unknown): value is SalaryType {
  return typeof value === 'string' && salaryTypes.includes(value as SalaryType)
}

export function normalizeSalaryAmount(value: unknown) {
  if (value === null || value === undefined || value === '') return null

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0) return null

  return Math.round(amount * 100) / 100
}
