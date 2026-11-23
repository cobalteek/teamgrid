<script setup lang="ts">
type PositionOption = {
  id: number
  fullName: string
}

const props = defineProps<{
  employeeQuery: string
  selectedPositionId: string
  positionOptions: PositionOption[]
}>()

defineEmits<{
  (event: 'update:employeeQuery' | 'update:selectedPositionId', value: string): void
  (event: 'clear'): void
}>()
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] p-3 lg:flex-row lg:items-center"
  >
    <label class="min-w-0 flex-1">
      <span class="sr-only">{{ $t('schedule.searchEmployee') }}</span>
      <input
        :value="props.employeeQuery"
        type="search"
        class="min-h-10 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--input-text)] transition outline-none placeholder:text-[var(--placeholder)] focus:border-[var(--text-blue)]"
        :placeholder="$t('schedule.searchEmployee')"
        @input="$emit('update:employeeQuery', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <label class="min-w-0 lg:w-64">
      <span class="sr-only">{{ $t('schedule.filterPosition') }}</span>
      <select
        :value="props.selectedPositionId"
        class="select min-h-10 w-full rounded-lg bg-[var(--input-bg)] px-3 text-sm"
        @change="$emit('update:selectedPositionId', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ $t('schedule.allPositions') }}</option>
        <option
          v-for="position in props.positionOptions"
          :key="position.id"
          :value="String(position.id)"
        >
          {{ position.fullName }}
        </option>
      </select>
    </label>
    <button
      v-if="props.employeeQuery || props.selectedPositionId"
      type="button"
      class="min-h-10 rounded-lg border border-[var(--border-main)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
      @click="$emit('clear')"
    >
      {{ $t('schedule.clearFilters') }}
    </button>
  </div>
</template>
