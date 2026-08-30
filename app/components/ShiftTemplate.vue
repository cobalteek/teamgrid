<script setup lang="ts">
import type { ScheduleTemplate } from '~~/types/shift';
const props = defineProps<{
  date: any
  modelValue: ScheduleTemplate
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: ScheduleTemplate): void
}>()

const templateGrid = ref<ScheduleTemplate>({
  workDays: props.modelValue.workDays,
  restDays: props.modelValue.restDays,
  endDate: new Date()
})

const formatedDate = ref()

if(props.date) {
  formatedDate.value = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short'
  }).format(props.date)
} else {
  formatedDate.value = ''
}

watch(
  templateGrid,
  value => {
    emit('update:modelValue', value)
  },
  { deep: true }
)

</script>

<template>
  <div
    class="flex flex-col items-center"
  >
  <h3 class="font-bold">{{ $t('ui.templateGrid') }}</h3>
  <h4>{{ $t('ui.startDate') + ': ' + formatedDate}}</h4>
  <div class="flex inline-flex">
    <h4>{{ $t('ui.endDate') + ': '}}</h4>
    <input type="date" v-model="templateGrid.endDate">
  </div>
    <div
      class="flex inline-flex justify-center gap-2"
    >
      <div class="flex flex-col items-end text-center gap-1">
        <h5 class="pr-2">{{ $t('ui.workDays') }}</h5>
        <input
          type="number"
          class="w-[40%] border rounded text-center"
          v-model="templateGrid.workDays"
        >
      </div>
      <p class="pt-7">/</p>
      <div class="flex flex-col gap-1">
        <h5>{{ $t('ui.restDays') }}</h5>
        <input
          type="number"
          class="w-[40%] border rounded text-center"
          v-model="templateGrid.restDays"
        >
      </div>
    </div>
  </div>
</template>