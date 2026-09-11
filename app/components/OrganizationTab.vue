<script setup lang="ts">
import { useOrganizationStore } from '~/stores/organization';

const organizationStore = useOrganizationStore()
const isEditOrganizationModalOpen = ref(false)
</script>

<template>
  <div class="flex flex-col items-center gap-3 text-center">
    <div
      v-for="org in organizationStore.optionsWithDescription"
      class="w-[200px] h-[100px] border rounded-xl"
      @click="isEditOrganizationModalOpen = true"
    >
      <h3 class="pt-2">{{ org.label }}</h3>
      <p class="text-sm text-gray-500">{{ org.description }}</p>
    </div>
  </div>
  <EditOrganizationModalContent
      :model-value="isEditOrganizationModalOpen"
      @close="isEditOrganizationModalOpen = false"
  />
</template>