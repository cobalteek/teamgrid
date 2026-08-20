<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import {ruBetterLocale, enBetterLocale} from '../../server/utils/betterLocaleCalendarEnRu'
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
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const events = computed(() => {
  return shiftStore.shifts.map(shift => ({
    id: shift.id,
    title: `${shift.employee.name} ${shift.position.name}`,
    start: shift.date,
    allDay: true,
    color: 'red'
  }))
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, listPlugin, interactionPlugin],

  initialView: 'dayGridMonth',

  locale: locale.value === 'ru' ? ruBetterLocale : enBetterLocale,
  selectable: true,
  firstDay: 1,
  dateClick: function(info: any) {
    isAddShiftModalOpen.value = true
    infoDate.value = info
  },
  // windowResize: function() {
  //   const api = calendarRef.value?.getApi()

  //   if (!api) return

  //   if (window.innerWidth < 768) {
  //     api.changeView('listWeek')
  //   } else {
  //     api.changeView('dayGridMonth')
  //   }
  // },

  events: events.value,
  // dayMaxEvents: window.innerWidth < 768 ? 1 : 3,
  moreLinkClick: 'popover',
   
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: window.innerWidth < 768 ? 'timeGridDay,listWeek' : 'dayGridMonth,timeGridWeek'
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
  }
}))

onMounted(async () => {
  await shiftStore.getShifts()
})

</script>

<template>
  <FullCalendar
    ref="calendarRef"
    :options="calendarOptions"
  />
  <AddShiftModalContent
    :info="infoDate"
    :model-value="isAddShiftModalOpen"
    @close="isAddShiftModalOpen = false"
  />
</template>