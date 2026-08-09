<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <section class="max-w-xl text-center">
    <h1 class="mb-4 text-4xl font-bold">Team Grid</h1>
    <p class="text-(--text-soft)">{{ $t('message.appInfo') }}</p>
    <p v-if="auth.user" class="mt-4">{{ $t('message.signed') }} {{ auth.user.name }}.</p>
  </section>
</template>
