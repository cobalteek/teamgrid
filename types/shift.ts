import type { Employee } from "./employee"
import type { Organization } from "./organization"
import type { Position } from "./position"
export type Shift = {
    id: string
    date: Date
    employeeId: string
    positionId: number
    organization: {
        id: number
        name: string
    }
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
}

export type ScheduleTemplate = {
  workDays: number
  restDays: number
  endDate: Date
}