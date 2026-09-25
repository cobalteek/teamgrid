<script setup lang="ts">
const auth = useAuthStore()
await auth.init()
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-[var(--bg-back)] text-[var(--text-main)]">
    <Header />
    <main class="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-3 sm:p-6">
      <slot />
    </main>
  </div>
</template>
