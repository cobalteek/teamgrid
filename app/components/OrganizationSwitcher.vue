<script setup lang="ts">
import type { Organization } from '~~/types/organization';
import {useOrganizationStore} from '../stores/organization'

const emit = defineEmits<{
  (e: 'addOrganization') : void
}>()

function addOrganization() {
  emit('addOrganization')
}

const organization = ref<Organization>({
  id: 1,
  name: '',
  description: ''
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
  <div class="flex w-full min-w-0 items-center gap-2 md:w-auto md:pl-2">
    <h4 class="hidden shrink-0 md:block">{{$t('ui.currentOrganization') + ':'}}</h4>
    <select v-model="organization.id" class="select min-h-11 min-w-0 flex-1 md:min-h-0 md:flex-none">
      <option
        v-for="org in organizationStore.options"
        :key="org.value"
        :value="org.value"
      >
        {{ org.label }}
      </option>
    </select>
    <button
      type="button"
      aria-label="Add organization"
      title="Add organization"
      @click="addOrganization"
      class="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--border-main)] px-2 text-xl md:min-h-0 md:min-w-0"
    >
      +
    </button>
  </div>
</template>
