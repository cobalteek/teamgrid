<script setup lang="ts">
import News from '~/components/News.vue'
import { activeBranch } from '~~/shared/utils/devTools';

const auth = useAuthStore()
</script>

<template>
  <main class="flex w-full flex-col items-center gap-10 px-4 py-8 sm:py-12">
    <section class="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
      <h1 class="mb-4 text-4xl font-bold">{{activeBranch === 'master' ? 'Team Grid' : 'Team Grid Development'}}</h1>
      <p class="text-(--text-soft)">
        {{ activeBranch === 'master' ? $t('message.appInfo') : $t('message.appInfoDev')}} 
        <a href="https://cobalteek.tech/teamgrid" target="_blank">TeamGrid</a>
      </p>
      <p v-if="auth.user" class="mt-4">{{ $t('message.signed') }} {{ auth.user.name }}.</p>
    </section>
    <News />
  </main>
</template>
