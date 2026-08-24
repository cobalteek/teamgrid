<script setup lang="ts">
import type { Organization } from '@prisma/client';
import {useOrganizationStore} from '../stores/organization'

const emit = defineEmits<{
  (e: 'addOrganization') : void
}>()

function addOrganization() {
  emit('addOrganization')
}

const organization = ref<Organization>({
  id: 0,
  name: ''
})

const organizationStore = useOrganizationStore()

watch(
  () => organizationStore.currentOrganization,
  (current) => {
    if(current)
    organization.value.id = current?.id
  },
  { immediate: true }
)

watch(organization.value, () => {
  const orgId = organization.value
  if(!orgId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.organization.notFound'
    })
  }
  organizationStore.changeOrganization(orgId)
  initializeApp()
})

</script>

<template>
  <div class="inline-flex gap-3 justify-center items-center">
    <h4>{{$t('ui.currentOrganization') + ':'}}</h4>
    <select v-model="organization.id">
      <option
        v-for="org in organizationStore.options"
        :key="org.value"
        :value="org.value"
      >
        {{ org.label }}
      </option>
    </select>
    <button @click="addOrganization" class="text-1xl border-1 px-2 rounded-sm">
      +
    </button>
  </div>
</template>