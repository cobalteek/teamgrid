<script setup lang="ts">
import OrganizationTab from '~/components/OrganizationTab.vue';

const auth = useAuthStore()

</script>

<template>
  <div class="flex flex-col w-full h-auto">
    <OrganizationTab v-if="auth.user" class="flex-1"/>
    <section class="max-w-xl text-center mx-auto flex flex-col items-center justify-center">
      <h1 class="mb-4 text-4xl font-bold">Team Grid</h1>
      <p class="text-(--text-soft)">{{ $t('message.appInfo') }}</p>
      <p v-if="auth.user" class="mt-4">{{ $t('message.signed') }} {{ auth.user.name }}.</p>
    </section>
  </div>
</template>
