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
  <div
    class="mobile-schedule__heading sticky top-0 z-[5] -mx-1 flex items-center justify-between gap-3 bg-[var(--bg-back)] px-1 pt-2 pb-4 shadow-[0_1px_0_var(--border-main)]"
  >
    <select
      :value="selectedMonth"
      class="min-h-11 min-w-0 flex-1 truncate rounded-[0.65rem] border border-transparent bg-transparent py-0 pr-2 pl-0 text-xl font-bold text-[var(--text-main)]"
      :aria-label="$t('ui.schedule')"
      @change="onMonthChange"
    >
      <option v-for="month in monthOptions" :key="month.value" :value="month.value">
        {{ month.label }}
      </option>
    </select>
    <div class="flex shrink-0 items-center gap-1.5">
      <div
        class="inline-flex min-h-11 overflow-hidden rounded-[0.65rem] border border-[var(--border-main)] bg-[var(--bg-context)]"
        role="group"
        :aria-label="$t('ui.scheduleView')"
      >
        <button
          type="button"
          class="border-r border-[var(--border-main)] px-1.5 text-xs text-[var(--text-muted)] transition-colors"
          :class="{ 'bg-[var(--bg-hover-context)] !text-[var(--text-main)]': viewMode === 'feed' }"
          @click="emit('set-view-mode', 'feed')"
        >
          {{ $t('ui.feedView') }}
        </button>
        <button
          type="button"
          class="px-1.5 text-xs text-[var(--text-muted)] transition-colors"
          :class="{ 'bg-[var(--bg-hover-context)] !text-[var(--text-main)]': viewMode === 'grid' }"
          @click="emit('set-view-mode', 'grid')"
        >
          {{ $t('ui.gridView') }}
        </button>
      </div>
      <button
        type="button"
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[0.65rem] border border-[var(--border-main)] bg-[var(--bg-context)] px-3 text-sm text-[var(--text-main)] transition duration-100 hover:bg-[var(--bg-hover-context)] active:scale-95"
        @click="emit('today')"
      >
        {{ $t('ui.today') }}
      </button>
    </div>
  </div>
</template>
