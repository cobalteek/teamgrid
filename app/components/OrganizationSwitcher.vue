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
const useInit = useInitializeApp()

watch(
  () => organizationStore.currentOrganization,
  (current) => {
    if(current)
    organization.value.id = current?.id
  },
  { immediate: true }
)

watch(organization.value, async () => {
  const orgId = organization.value
  if(!orgId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.organization.notFound'
    })
  }
  await organizationStore.changeOrganization(orgId)
  await useInit.init()
})

</script>

<template>
  <div class="inline-flex gap-3 pl-2 justify-center items-center">
    <h4 class="block max-sm:hidden">{{$t('ui.currentOrganization') + ':'}}</h4>
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