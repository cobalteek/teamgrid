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

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],

  initialView: props.settings.initialView,

  locale: locale.value,
  selectable: true,
  firstDay: 1,

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  }
}))
</script>

<template>
  <FullCalendar :options="calendarOptions" />
</template>