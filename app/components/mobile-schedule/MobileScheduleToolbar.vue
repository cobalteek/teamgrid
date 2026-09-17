<script setup lang="ts">
import type { MobileScheduleViewMode } from '~/composables/useMobileScheduleDates'

defineProps<{
  monthOptions: Array<{ value: string; label: string }>
  selectedMonth: string
  viewMode: MobileScheduleViewMode
}>()

const emit = defineEmits<{
  (e: 'select-month', monthKey: string): void
  (e: 'set-view-mode', mode: MobileScheduleViewMode): void
  (e: 'today'): void
}>()

function onMonthChange(event: Event) {
  emit('select-month', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <div class="mobile-schedule__heading">
    <select
      :value="selectedMonth"
      class="mobile-schedule__month-select mobile-schedule__month-select--title"
      :aria-label="$t('ui.schedule')"
      @change="onMonthChange"
    >
      <option v-for="month in monthOptions" :key="month.value" :value="month.value">
        {{ month.label }}
      </option>
    </select>
    <div class="mobile-schedule__heading-actions">
      <div class="mobile-schedule__view-toggle" role="group" :aria-label="$t('ui.scheduleView')">
        <button
          type="button"
          :class="{ 'mobile-schedule__view-button--active': viewMode === 'feed' }"
          @click="emit('set-view-mode', 'feed')"
        >
          {{ $t('ui.feedView') }}
        </button>
        <button
          type="button"
          :class="{ 'mobile-schedule__view-button--active': viewMode === 'grid' }"
          @click="emit('set-view-mode', 'grid')"
        >
          {{ $t('ui.gridView') }}
        </button>
      </div>
      <button type="button" class="mobile-schedule__today" @click="emit('today')">
        {{ $t('ui.today') }}
      </button>
    </div>
  </div>
</template>
