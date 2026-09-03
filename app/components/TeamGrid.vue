<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {ruBetterLocale, enBetterLocale} from '~~/shared/utils/betterLocaleCalendarEnRu'
import { useShiftStore } from '../stores/shift'
import { useOrganizationStore } from '../stores/organization'
import { useEmployeeStore } from '../stores/employee'

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
      title: `${shift.position.name} ${shift.employee.name}`,
      start: new Date(shift.date).toISOString().split('T')[0],
      allDay: true,

      extendedProps: {
      employeeId: shift.employee.id,
      positionId: shift.position.id,

      employeeColor: shift.employee.color,
      positionColor: shift.position.color
      } 
    } 
  })
})

const isAddEmployeeModalOpen = ref(false)
const isEditOrganizationModalOpen = ref(false)
const organizationStore = useOrganizationStore()
const employeeStore = useEmployeeStore()
const organization = ref()

const calendarWrapper = ref<HTMLElement | null>(null)
const eventElements = new Map<string, HTMLElement[]>()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)

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
  aspectRatio: 1.2,
  locale: locale.value === 'ru' ? ruBetterLocale : enBetterLocale,
  firstDay: 1,
  dateClick: function(info: any) {
    selectedEmployeeId.value = null
    selectedPositionId.value = null

    if(employeeStore.employees.length === 0) {
      isAddEmployeeModalOpen.value = true
      return
    } else {
      isAddShiftModalOpen.value = true
    }
    infoDate.value = info
  },
  moreLinkClick: 'popover',
  customButtons: {
    addEmployee: {
      text: $t('btn.addEmployee') as string,
      click: () => {
        isAddEmployeeModalOpen.value = true
      }
    },
    editOrganization: {
      text: $t('btn.edit') as string,
      click: () => {
        isEditOrganizationModalOpen.value = true
      }
    }
  },
   
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'addEmployee editOrganization'
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
  const employeeColor =
    info.event.extendedProps.employeeColor

  const positionColor =
    info.event.extendedProps.positionColor

  info.el.style.background = `
    linear-gradient(
      110deg,
      ${positionColor} 0%,
      ${positionColor} 50%,
      ${employeeColor} 50%,
      ${employeeColor} 100%
    )
  `
  info.el.addEventListener('contextmenu', async (e: MouseEvent) => {
    e.preventDefault()

    const confirmed = confirm($t('ui.shiftDeleteConfirm') as string)

    if (confirmed) {
      await shiftStore.deleteShift(info.event.id)
    }
  })

  const eventId = String(info.event.id)

  const elements = eventElements.get(eventId) ?? []

  elements.push(info.el)

  eventElements.set(eventId, elements)

  updateEventOpacity(info.event)
}

function getEventOpacity(
  employeeId: number,
  positionId: number
) {
  if (
    selectedEmployeeId.value === null &&
    selectedPositionId.value === null
  ) {
    return 1
  }

  if (selectedEmployeeId.value !== null) {
    return selectedEmployeeId.value === employeeId
      ? 1
      : 0.35
  }

  if (selectedPositionId.value !== null) {
    return selectedPositionId.value === positionId
      ? 1
      : 0.35
  }

  return 1
}

function updateEventOpacity(event: any) {
  const employeeId =
    event.extendedProps.employeeId

  const positionId =
    event.extendedProps.positionId

  const opacity = getEventOpacity(
    employeeId,
    positionId
  )

  const elements = eventElements.get(
    String(event.id)
  )

  elements?.forEach(element => {
    element.style.opacity = String(opacity)
  })
}

function updateAllEventsOpacity() {
  const calendarApi = calendarRef.value?.getApi()

  if (!calendarApi) return

  calendarApi.getEvents().forEach((event) => {
    updateEventOpacity(event)
  })
}

watch(
  [selectedEmployeeId, selectedPositionId],
  () => {
    updateAllEventsOpacity()
  }
)

watch(isEditOrganizationModalOpen, () => {
  organization.value = computed(() => {
    organizationStore.currentOrganization?.name
  })
})
</script>

<template>
  <div
    ref="calendarWrapper"
    @click="resetSelection"
  >
    <FullCalendar
      ref="calendarRef"
      :options="calendarOptions"
    />
  </div>
  <AddShiftModalContent
    :info="infoDate"
    :model-value="isAddShiftModalOpen"
    @close="isAddShiftModalOpen = false"
  />
  <AddEmployeeModalContent
      :model-value="isAddEmployeeModalOpen"
      @close="isAddEmployeeModalOpen = false"
    />
    <EditOrganizationModalContent
      :model-value="isEditOrganizationModalOpen"
      @close="isEditOrganizationModalOpen = false"
    />
</template>