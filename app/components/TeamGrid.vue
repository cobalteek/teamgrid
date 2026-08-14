<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'


const { locale } = useI18n()
const props = defineProps<{
  settings: {
    initialView: string
  }
}>()

const ruBetterLocale = {
  code: 'ru',
  week: {
    dow: 1,
    doy: 7
  },
  buttonText: {
    prev: 'Пред',
    next: 'След',
    today: 'Сегодня',
    month: 'Месяц',
    week: 'Неделя',
    day: 'День',
    list: 'Повестка дня'
  },
  weekText: 'Неделя',
  allDayText: 'Весь день',
  moreLinkText(n : number) {
    return '+ ещё ' + n
  },
  
  noEventsText: 'Нет событий для отображения'
}

const enBetterLocale = {
  code: 'en',
  week: {
    dow: 1,
    doy: 7
  },
  buttonText: {
    prev: 'Prev',
    next: 'Next',
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List'
  },
  weekText: 'Wk',
  allDayText: 'All-day',
  moreLinkText(n : number) {
    return '+ more ' + n
  },
  
  noEventsText: 'No events to display'
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],

  initialView: props.settings.initialView || 'dayGridMonth',

  locale: locale.value === 'ru' ? ruBetterLocale : enBetterLocale,
  selectable: true,
  firstDay: 1,
  

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
  <FullCalendar :options="calendarOptions" />
</template>