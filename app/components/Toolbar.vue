<script setup lang="ts">
import { Calendar } from '@fullcalendar/core/index.js';

const isAddEmployeeModalOpen = ref(false)
const isEditOrganizationModalOpen = ref(false)
const organizationStore = useOrganizationStore()
const organization = ref()

watch(isEditOrganizationModalOpen, () => {
  organization.value = computed(() => {
    organizationStore.currentOrganization?.name
  })
})

</script>

<template>
    <div class="flex justify-end flex-row gap-2 w-full mb-3">
    <button @click="isAddEmployeeModalOpen = true" class="btn">
        {{$t('btn.addEmployee')}}
    </button>
    <button class="btn">
      {{ $t('btn.changePostEmployee') }}
    </button>
    <button @click="isEditOrganizationModalOpen = true" class="btn">
      {{ $t('btn.edit') }}
    </button>
    <AddEmployeeModalContent
      :model-value="isAddEmployeeModalOpen"
      @close="isAddEmployeeModalOpen = false"
    />
    <EditOrganizationModalContent
      :model-value="isEditOrganizationModalOpen"
      @close="isEditOrganizationModalOpen = false"
      :organization="organization"
    />
  </div>
</template>