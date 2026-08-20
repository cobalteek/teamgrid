<script setup lang="ts">
import { log } from 'console';
import {useOrganizationStore} from '../stores/organization'

const emit = defineEmits<{
  (e: 'addOrganization') : void
}>()

function addOrganization() {
  emit('addOrganization')
}

const organizationStore = useOrganizationStore()

onMounted(async () => {
  await organizationStore.getOrganizations()
})

</script>

<template>
  <div class="inline-flex gap-3 justify-center items-center">
    <h4>{{$t('ui.currentOrganization') + ':'}}</h4>
    <select v-model="organizationStore.currentOrganizationId">
      <option
        v-for="org in organizationStore.organizations"
        :key="org.id"
        :value="org.id"
      >
        {{ org.name }}
      </option>
    </select>
    <button @click="addOrganization" class="text-1xl border-1 px-2 rounded-sm">
      +
    </button>
  </div>
</template>