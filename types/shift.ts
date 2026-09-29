import type { Employee } from './employee'
import type { Organization } from './organization'
import type { Position } from './position'
export type Shift = {
  id: string
  date: Date
  employeeId: string
  positionId: number
  organization: {
    id: number
    name: string
  }
  allDay: boolean
  startTime: number | null
  endTime: number | null
}

export type ShiftWithRelations = Shift & {
  employee: Employee
  position: Position
  organization: Organization
}

export type CreateShift = {
  date: string
  employeeId: string
  positionId: number
  allDay: boolean
  startTime?: number
  endTime?: number
}

export type DeleteShiftFilters = {
  startDate?: string
  endDate?: string
  employeeIds?: string[]
  positionIds?: number[]
  deleteAll?: boolean
}

export type ScheduleTemplate = {
  workDays: number
  restDays: number
  endDate: string
}
