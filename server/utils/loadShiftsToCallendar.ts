import { Calendar, CalendarApi } from '@fullcalendar/core/index.js'
import {useShiftStore} from '../../app/stores/shift'
import {useEmployeeStore} from '../../app/stores/employee'
import {usePositionStore} from '../../app/stores/position'
import FullCalendar from '@fullcalendar/vue3'

export async function loadShiftsToCallendar(calendarApi: CalendarApi) {
  const shiftStore = useShiftStore()
  const employeeStore = useEmployeeStore()
  const positionStore = usePositionStore()
  await shiftStore.getShifts()
  console.log(shiftStore.shifts)
  for(const s of shiftStore.shifts) {
    const emp = await employeeStore.getEmployeeById(s.employeeId)
    const pos = await positionStore.getPositionById(s.positionId)
    calendarApi?.addEvent({
      id: s.id,
      title: `${emp.surname} ${emp.name} ${pos.name}`,
      start: s.date,
      allDay: true
    })
  }

}