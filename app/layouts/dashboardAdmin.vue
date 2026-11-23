<script setup lang="ts">
import { useInitializeApp } from '~/composables/appInit'
const useInit = useInitializeApp()
const isClientReady = ref(false)

onMounted(() => {
  isClientReady.value = true
})

await useInit.init()

const route = useRoute()
const isFullWidthPage = computed(() => route.name === 'schedule' || route.name === 'bonus')
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-[var(--bg-back)] text-[var(--text-main)]">
    <Header />
    <main
      v-if="isClientReady"
      class="mx-auto flex w-full min-w-0 flex-1 p-2 sm:p-6"
      :class="isFullWidthPage ? 'max-w-none' : 'max-w-7xl'"
    >
      <slot />
    </main>
    <main v-else class="flex flex-1 items-center justify-center p-6">
      <Loading class="min-h-[180px] w-full" />
    </main>
  </div>
</template>
