<script setup lang="ts">
import News from '~/components/news.vue'

const auth = useAuthStore()
</script>

<template>
  <main class="flex w-full flex-col items-center gap-10 px-4 py-8 sm:py-12">
    <section class="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
      <h1 class="mb-4 text-4xl font-bold">Team Grid</h1>
      <p class="text-(--text-soft)">{{ $t('message.appInfo') }}</p>
      <p v-if="auth.user" class="mt-4">{{ $t('message.signed') }} {{ auth.user.name }}.</p>
    </section>
    <News />
  </main>
</template>
