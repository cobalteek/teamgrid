export const bonusScopes = ['organization', 'position', 'employee'] as const
export const builtInBonusVariables = ['salary', 'hours', 'shifts', 'days'] as const

export type BonusScope = (typeof bonusScopes)[number]
export type BonusVariables = Record<string, number>

export type BonusRule = {
  id: number
  name: string
  scope: BonusScope
  formula: string
  variableNames: string[]
  positionId: number | null
  employeeId: string | null
  position: { id: number; name: string; fullName: string } | null
  employee: { id: string; name: string; surname: string; middlename: string } | null
  variables: BonusVariables
}

export type BonusCalculationRow = {
  employeeId: string
  employeeName: string
  positionName: string
  baseSalary: number
  bonus: number
  total: number
  rule: Pick<BonusRule, 'id' | 'name' | 'scope' | 'formula'> | null
  missingVariables: string[]
}

export type BonusCalculation = {
  month: string
  rows: BonusCalculationRow[]
  totalBaseSalary: number
  totalBonus: number
  total: number
}

export function isBonusScope(value: unknown): value is BonusScope {
  return typeof value === 'string' && bonusScopes.includes(value as BonusScope)
}

export function isMonthKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}
