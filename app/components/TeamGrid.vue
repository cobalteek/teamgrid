<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import {ruBetterLocale, enBetterLocale} from '../../server/utils/betterLocaleCalendarEnRu'
import { useShiftStore } from '../stores/shift'
import {loadShiftsToCallendar} from '../../server/utils/loadShiftsToCallendar'
import '@fullcalendar/vue3'

const { locale } = useI18n()
const props = defineProps<{
  settings: {
    initialView: string
  }
}>()

const isAddShiftModalOpen = ref(false)
const infoDate = ref()
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const calendarApi = calendarRef.value?.getApi()
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],

  initialView: props.settings.initialView || 'dayGridMonth',

  locale: locale.value === 'ru' ? ruBetterLocale : enBetterLocale,
  selectable: true,
  firstDay: 1,
  dateClick: function(info: any) {
    isAddShiftModalOpen.value = true
    infoDate.value = info
  },
  // events: computed(async () => {
  //   if(calendarApi)
  //   await loadShiftsToCallendar(calendarApi)
  // }),
   

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
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