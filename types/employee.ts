import type { SalaryFormType, SalaryType } from './salary'

export type Employee = {
  id: string
  name: string
  surname: string
  middlename: string
  positionId?: number
  position: {
    id: number
    name: string
    fullName: string
  }
  email: string
  organization: {
    id: number
    name: string
  }
  color: string
  sortOrder: number
  salaryType: SalaryType | 'none' | null
  salaryAmount: number | null
}

export type CreateEmployee = {
  name: string
  surname: string
  middlename: string
  position: string
  email: string
  organizationId: number
  salaryType?: SalaryFormType | null
  salaryAmount?: number | string | null
}
