import type { Employee } from "./employee"
import type { Position } from "./position"
export type Shift = {
    id: string
    date: Date
    employeeId: string
    positionId: number
}

export type ShiftWithRelations = Shift & {
  employee: Employee
  position: Position
}

export type CreateShift = {
    date: string
    employeeId: string
    positionId: number
}