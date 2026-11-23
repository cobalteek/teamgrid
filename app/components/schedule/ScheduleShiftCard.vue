<script setup lang="ts">
import type { ShiftWithRelations } from '~~/types/shift'

const props = defineProps<{
  shift: ShiftWithRelations
  isOnVacation: boolean
}>()

defineEmits<{
  (event: 'delete', shift: ShiftWithRelations): void
}>()

const { t } = useI18n()
const { formatTime } = useUserDisplayPreferences()

function timeLabel(shift: ShiftWithRelations) {
  if (shift.allDay || shift.startTime === null || shift.endTime === null) {
    return t('schedule.allDay')
  }

  return `${formatTime(shift.startTime)}–${formatTime(shift.endTime)}`
}

function positionLabel(shift: ShiftWithRelations) {
  return shift.position?.name || t('schedule.noPosition')
}
</script>

<template>
  <div
    class="rounded-md border border-l-4 border-[var(--border-main)] bg-[var(--input-bg)] px-2 py-1.5 shadow-sm transition-opacity"
    :class="props.isOnVacation ? 'opacity-50 hover:opacity-100' : ''"
    :style="{
      borderLeftColor:
        props.shift.position?.color || props.shift.employee?.color || 'var(--text-blue)',
    }"
    :title="`${timeLabel(props.shift)} · ${positionLabel(props.shift)}`"
    @click.stop
    @contextmenu.stop.prevent="$emit('delete', props.shift)"
  >
    <div class="text-xs font-bold text-[var(--text-main)]">
      {{ timeLabel(props.shift) }}
    </div>
    <div class="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
      {{ positionLabel(props.shift) }}
    </div>
  </div>
</template>
