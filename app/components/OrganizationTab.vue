<script setup lang="ts">
import { useOrganizationStore } from '~/stores/organization'

const organizationStore = useOrganizationStore()
function goToOrganization() {
  navigateTo(`/dashboard/`)
}
</script>

<template>
  <div class="flex flex-col items-center gap-3 text-center">
    <div
      v-for="org in organizationStore.optionsWithDescription"
      class="h-[100px] w-[200px] rounded-xl border"
      @click="goToOrganization()"
    >
      <h3 class="pt-2">{{ org.label }}</h3>
      <p class="text-sm text-gray-500">{{ org.description }}</p>
    </div>
  </div>
</template>
