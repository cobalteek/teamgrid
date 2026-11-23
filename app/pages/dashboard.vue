<script setup lang="ts">
import '../components/TeamGrid.vue'
import { useUserSettingsStore } from '~/stores/userSettings'

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard-admin',
})
const organizationStore = useOrganizationStore()
const settingsStore = useUserSettingsStore()
const title = computed(() => organizationStore.currentOrganization?.name)

if (import.meta.client) {
  document.documentElement.classList.toggle('light', settingsStore.settings.theme === 'light')
}

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
