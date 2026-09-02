<script setup lang="ts">
import type { Organization } from '~~/types/organization';

const newOrganization = ref<Organization>({
  id: 0,
  name: ''
})

const errorModal = useErrorModal()
const organizationStore = useOrganizationStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
  (e: 'submit'): void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

const handleCancel = () => {
  newOrganization.value.name = ''
  emit('close')
}

const handleSubmit = async () => {
  if(!isValidName(newOrganization.value.name)) {
    errorModal.showError('error.organization.invalidName')
    return
  }
  try {
    await organizationStore.createOrganization(newOrganization.value.name)
  } catch(error: any) {
    errorModal.showError(error.message || 'error.organization.create')
    return
  }
  emit('submit')
  emit('close')
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
  >
    <Form
      title="ui.organization.add"
      :fields="[{ key: 'name', type: 'text', placeholder: 'placeholder.organizationName'}]"  
      v-model="newOrganization"
      submitBtnName="ui.organization.add"
      :is-loading="organizationStore.isLoading"
      @submit="handleSubmit"
      @close="handleCancel"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>