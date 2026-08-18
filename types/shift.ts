export type Shift = {
    id: string
    date: Date
    employeeId: string
    positionId: number
}

export type CreateShift = {
    date: string
    employeeId: string
    positionId: number
}