export type Vacation = {
  id: string
  startDate: string
  endDate: string
  note: string | null
  employeeId: string
  employee: {
    id: string
    name: string
    surname: string
    middlename: string
  }
}

export type CreateVacation = {
  employeeId: string
  startDate: string
  endDate: string
  note?: string | null
}

export type VacationRange = {
  startDate?: string
  endDate?: string
}
