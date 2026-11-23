<script setup lang="ts">
defineProps<{
  monthTitle: string
}>()

defineEmits<{
  (event: 'today' | 'previous-month' | 'next-month'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p class="text-sm font-medium text-[var(--text-muted)]">{{ $t('schedule.subtitle') }}</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
        {{ $t('schedule.title') }}
      </h1>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="min-h-10 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
        @click="$emit('today')"
      >
        {{ $t('ui.today') }}
      </button>
      <div
        class="flex items-center overflow-hidden rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)]"
      >
        <button
          type="button"
          class="grid h-10 w-10 place-items-center text-lg text-[var(--text-soft)] transition hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-main)]"
          :aria-label="$t('schedule.previousMonth')"
          @click="$emit('previous-month')"
        >
          ‹
        </button>
        <div
          class="min-w-36 border-x border-[var(--border-main)] px-3 text-center text-sm font-semibold text-[var(--text-main)]"
        >
          {{ monthTitle }}
        </div>
        <button
          type="button"
          class="grid h-10 w-10 place-items-center text-lg text-[var(--text-soft)] transition hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-main)]"
          :aria-label="$t('schedule.nextMonth')"
          @click="$emit('next-month')"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>
