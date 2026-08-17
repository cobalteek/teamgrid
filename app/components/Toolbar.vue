<script setup lang="ts">
import { Calendar } from '@fullcalendar/core/index.js';

const isAddEmployeeModalOpen = ref(false)

// function sendEvent() {
//   const event = {
//     title: 'New Event',
//     start: new Date(),
//     allDay: true
//   }
//   emit('send-event', event)
// }

</script>

<template>
  <div class="flex justify-end flex-row gap-2 w-full mb-3">
    <button @click="isAddEmployeeModalOpen = true" class="btn">
        {{$t('btn.addEmployee')}}
    </button>
    <button class="btn">
      {{ $t('btn.changePostEmployee') }}
    </button>
    <button class="btn">
      {{ $t('btn.edit') }}
    </button>
    <AddEmployeeModalContent
      :model-value="isAddEmployeeModalOpen"
      @close="isAddEmployeeModalOpen = false"
    />
  </div>
</template>