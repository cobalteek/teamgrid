<script setup lang="ts">
const auth = useAuthStore()
watch(() => auth.user, async () => {
  const initApp = useInitializeApp()
  await initApp.init()
})
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-back)] text-[var(--text-main)]">
    <Header/>
    <main class="mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-5xl items-center justify-center p-3 sm:p-6">
      <slot/>
    </main>
  </div>
</template>
