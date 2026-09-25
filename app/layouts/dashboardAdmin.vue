<script setup lang="ts">
import { useInitializeApp } from '~/composables/appInit'
const useInit = useInitializeApp()
await useInit.init()
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-[var(--bg-back)] text-[var(--text-main)]">
    <Header />
    <main class="mx-auto flex w-full max-w-6xl min-w-0 flex-1 p-2 sm:p-6">
      <slot />
    </main>
  </div>
</template>
