<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {ruBetterLocale, enBetterLocale} from '../../shared/utils/betterLocaleCalendarEnRu'
import { useShiftStore } from '../stores/shift'
import '@fullcalendar/vue3'

const { locale } = useI18n()
const props = defineProps<{
  settings: {
    initialView: string
  }
}>()

const isAddShiftModalOpen = ref(false)
const infoDate = ref()

const shiftStore = useShiftStore()

const selectedEmployeeId = ref<number | null>(null)
const selectedPositionId = ref<number | null>(null)
const events = computed(() => {
  return shiftStore.shifts.map(shift => {
    return {
      id: shift.id,
      title: `${shift.employee.name} ${shift.position.name}`,
      start: new Date(shift.date).toISOString().split('T')[0],
      allDay: true,

      extendedProps: {
      employeeId: shift.employee.id,
      positionId: shift.position.id,

      employeeColor: shift.employee.color,
      positionColor: shift.position.color,

      opacity: getEventOpacity(shift)
      } 
    } 
  })
})



const calendarWrapper = ref<HTMLElement | null>(null)

function resetSelection(event: MouseEvent) {
  const target = event.target as HTMLElement

  if (!target.closest('.fc-event')) {
    selectedEmployeeId.value = null
    selectedPositionId.value = null
  }
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, listPlugin, interactionPlugin],

  initialView: 'dayGridMonth',

  locale: locale.value === 'ru' ? ruBetterLocale : enBetterLocale,
  firstDay: 1,
  dateClick: function(info: any) {
    selectedEmployeeId.value = null
    selectedPositionId.value = null
    isAddShiftModalOpen.value = true
    infoDate.value = info
  },
  moreLinkClick: 'popover',
   
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek'
  },

  titleFormat: (date : any) => {
    const title = date.date.marker.toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'long',
      year: 'numeric'
    })
    const result = title.replace(' г.', '')

    return result.charAt(0).toUpperCase() + result.slice(1)
  },

  dayHeaderContent(arg : any) {
    const text = arg.date.toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'short'
    })

    return text.charAt(0).toUpperCase() + text.slice(1)
  },
  events: events.value,
  eventDidMount,
  eventClick(info: any) {
    const rect = info.el.getBoundingClientRect()

    const x = info.jsEvent.clientX - rect.left
    const y = info.jsEvent.clientY - rect.top

    const employeeId = info.event.extendedProps.employeeId
    const positionId = info.event.extendedProps.positionId

    const diagonalX =
      rect.width * 0.5 +
      (y / rect.height - 0.5) * 20

    if (x < diagonalX) {
      selectedEmployeeId.value =
        selectedEmployeeId.value === employeeId
          ? null
          : employeeId

      selectedPositionId.value = null
    } else {
      selectedPositionId.value =
        selectedPositionId.value === positionId
          ? null
          : positionId

      selectedEmployeeId.value = null
    }
  }
}))

function eventDidMount(info: any) {
  const employeeColor = info.event.extendedProps.employeeColor
  const positionColor = info.event.extendedProps.positionColor

  info.el.style.background = `
    linear-gradient(
      110deg,
      ${employeeColor} 0%,
      ${employeeColor} 50%,
      ${positionColor} 50%,
      ${positionColor} 100%
    )
  `

  info.el.style.opacity = String(
    info.event.extendedProps.opacity
  )
}

function getEventOpacity(shift: any) {
  if (
    selectedEmployeeId.value === null &&
    selectedPositionId.value === null
  ) {
    return 1
  }

  if (selectedEmployeeId.value !== null) {
    return shift.employee.id === selectedEmployeeId.value
      ? 1
      : 0.35
  }

  // Выбрана должность
  if (selectedPositionId.value !== null) {
    return shift.position.id === selectedPositionId.value
      ? 1
      : 0.35
  }

  return 1
}

</script>

<template>
  <div
    ref="calendarWrapper"
    @click="resetSelection"
  >
    <FullCalendar
      ref="calendarRef"
      :key="`${selectedEmployeeId}-${selectedPositionId}`"
      :options="calendarOptions"
    />
  </div>
  <AddShiftModalContent
    :info="infoDate"
    :model-value="isAddShiftModalOpen"
    @close="isAddShiftModalOpen = false"
  />
</template>