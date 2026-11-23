import type { SalaryType } from './salary'

export type Position = {
  id: number
  name: string
  fullName: string
  organization: {
    id: number
    name: string
  }
  color: string
  salaryType: SalaryType | null
  salaryAmount: number | null
}
