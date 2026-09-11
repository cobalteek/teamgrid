<script setup lang="ts">
import {useInitializeApp} from "~/composables/appInit";
const useInit = useInitializeApp()
await useInit.init()
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-back)] text-[var(--text-main)]">
    <Header/>
    <main class="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-6xl min-w-0 p-2 sm:p-6">
      <slot/>
    </main>
  </div>
</template>
