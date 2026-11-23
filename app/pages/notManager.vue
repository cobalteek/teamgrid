<script setup lang="ts"></script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center gap-4">
    <h1 class="text-2xl font-bold">{{ $t('message.notManager') }}</h1>
    <p class="text-center text-(--text-soft)">
      {{ $t('message.notManagerInfo') }}
    </p>
    <NuxtLink
      to="/dashboard"
      class="rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
    >
      {{ $t('btn.goDashboard') + ' -->' }}
    </NuxtLink>
  </div>
</template>
