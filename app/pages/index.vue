<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <section class="max-w-xl text-center">
    <h1 class="mb-4 text-4xl font-bold">Fullstack Starter</h1>
    <p class="text-(--text-soft)">A clean Nuxt full-stack foundation based on the existing project infrastructure.</p>
    <p v-if="auth.user" class="mt-4">Signed in as {{ auth.user.name }}.</p>
  </section>
</template>
