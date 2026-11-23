export type ScheduleDay = {
  key: string
  date: Date
  weekday: string
  number: string
  isToday: boolean
  isHoliday: boolean
}

export type ScheduleRow = {
  id: string
  label: string
  positionLabel: string
  color: string
  isUnassigned?: boolean
}

export type PositionStat = {
  name: string
  hours: number
}

export type ReorderEmployeesPayload = {
  draggedId: string
  targetId: string
  dropAfterTarget: boolean
}
