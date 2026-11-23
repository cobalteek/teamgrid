<script setup lang="ts">
import type { PositionStat } from '~~/types/schedule'

const props = defineProps<{
  totalHours: number
  shiftCount: number
  employeeCount: number
  totalSalary: number
  positionStats: PositionStat[]
  formatHours: (hours: number) => string
  formatMoney: (amount: number) => string
}>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4">
      <p class="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {{ $t('schedule.totalHours') }}
      </p>
      <p class="mt-2 text-2xl font-bold text-[var(--text-main)]">
        {{ props.formatHours(props.totalHours) }}
      </p>
    </div>
    <div class="rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4">
      <p class="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {{ $t('schedule.shiftCount') }}
      </p>
      <p class="mt-2 text-2xl font-bold text-[var(--text-main)]">{{ props.shiftCount }}</p>
    </div>
    <div class="rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4">
      <p class="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {{ $t('schedule.employeeCount') }}
      </p>
      <p class="mt-2 text-2xl font-bold text-[var(--text-main)]">{{ props.employeeCount }}</p>
    </div>
    <div class="rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4">
      <p class="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
        {{ $t('schedule.salaryTotal') }}
      </p>
      <p class="mt-2 text-2xl font-bold text-[var(--text-main)]">
        {{ props.formatMoney(props.totalSalary) }}
      </p>
    </div>
  </div>

  <div v-if="props.positionStats.length" class="flex min-w-0 flex-wrap items-center gap-2">
    <span class="mr-1 text-sm font-semibold text-[var(--text-muted)]"
      >{{ $t('schedule.byPosition') }}:</span
    >
    <span
      v-for="stat in props.positionStats"
      :key="stat.name"
      class="rounded-full border border-[var(--border-main)] bg-[var(--bg-context)] px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)]"
    >
      {{ stat.name }} · {{ props.formatHours(stat.hours) }}
    </span>
  </div>
</template>
