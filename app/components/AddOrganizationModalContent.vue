<script setup lang="ts">
import { useOrganizationStore } from '~/stores/organization'
import type { Organization } from '~~/types/organization'

const newOrganization = ref<Organization>({
  id: 0,
  name: '',
  description: '',
})

const errorModal = useErrorModal()
const organizationStore = useOrganizationStore()
const isSubmitting = ref(false)

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
  if (!isValidName(newOrganization.value.name)) {
    errorModal.showError('error.organization.invalidName')
    return
  }

  isSubmitting.value = true

  try {
    await organizationStore.createOrganization(
      newOrganization.value.name,
      newOrganization.value.description,
    )
  } catch (error: any) {
    isSubmitting.value = false
    errorModal.showError(error.message || 'error.organization.create')
    return
  }
  emit('submit')
  emit('close')
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isSubmitting.value = false
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      title="ui.organization.add"
      :fields="[{ key: 'name', type: 'text', placeholder: 'placeholder.organizationName' }]"
      v-model="newOrganization"
      submitBtnName="ui.organization.add"
      :is-loading="isSubmitting"
      @submit="handleSubmit"
      @close="handleCancel"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="top-1/4 h-[200px] w-[300px]"
  />
</template>
