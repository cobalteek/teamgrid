<script setup lang="ts">
import '../components/TeamGrid.vue'

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard-admin',
})
const organizationStore = useOrganizationStore()
const title = computed(() => organizationStore.currentOrganization?.name)

useHead({
  title: title,
})

const toggleView = 'dayGridMonth'
</script>

<template>
  <div class="w-full max-sm:h-full">
    <TeamGrid :settings="{ initialView: toggleView }" />
  </div>
</template>
