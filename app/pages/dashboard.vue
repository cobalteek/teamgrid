<script setup lang="ts">
import '../components/Day.vue'
const auth = useAuthStore()

definePageMeta({
  middleware: ['auth'],
})
</script>

<template>
  <section class="max-w-xl text-center">
    <h1 class="mb-4 text-4xl font-bold">{{ $t('pages.dashboard') }}</h1>
    <p>{{$t('message.welcome')}}, {{ auth.user?.name }}.</p>
    <p class="mt-2 text-(--text-soft)">{{ $t('message.signUser') }}</p>
  </section>
  <Day/>
</template>
