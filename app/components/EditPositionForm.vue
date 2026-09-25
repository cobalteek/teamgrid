<script setup lang="ts">
import Modal from './Modal.vue'
import { usePositionStore } from '~/stores/position'
import { useOrganizationStore } from '~/stores/organization.ts'
import type { Position } from '~~/types/position'
import { isValidPosition } from '~~/shared/utils/validation'

const props = defineProps<{
  modelValue: boolean
  positionId: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close' | 'submit'): void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}
const organizationStore = useOrganizationStore()
const positionStore = usePositionStore()
const position = ref<Position>({
  id: 0,
  name: '',
  fullName: '',
  organization: {
    id: 0,
    name: '',
  },
  color: '',
})
const errorModal = useErrorModal()
const initApp = useInitializeApp()
const isSubmitting = ref(false)

const resetModal = () => {
  position.value = {
    id: 0,
    name: '',
    fullName: '',
    organization: {
      id: 0,
      name: '',
    },
    color: '',
  }
}

async function handleSubmit() {
  if (!isValidPosition(position.value.name) || !isValidPosition(position.value.fullName)) {
    errorModal.showError('error.invalidName')
    return
  }

  isSubmitting.value = true

  try {
    await positionStore.changePosition(position.value)
  } catch (e) {
    isSubmitting.value = false
    console.log(e)
    return
  } finally {
    await initApp.init()
  }
  resetModal()
  emit('close')
}

function handleCancel() {
  resetModal()
  emit('close')
}

async function handleDelete() {
  isSubmitting.value = true

  try {
    const isManager = await organizationStore.isManager()

    if (!isManager) {
      isSubmitting.value = false
      errorModal.showError('error.onlyManager')
      return
    }

    await positionStore.deletePosition(position.value.id)
    emit('close')
  } catch (e) {
    isSubmitting.value = false
    errorModal.showError(e as string)
    console.error(e)
  } finally {
    resetModal()
    await initApp.init()
  }
  emit('close')
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isSubmitting.value = false
      const _position = positionStore.positions.find((position) => position.id === props.positionId)

      if (_position) {
        position.value = {
          ..._position,
          organization: { ..._position.organization },
        }
      }
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      v-if="position"
      v-model:model-value="position"
      title="ui.positionEdit"
      :fields="[
        { key: 'name', type: 'text', placeholder: 'placeholder.positionName' },
        { key: 'fullName', type: 'text', placeholder: 'placeholder.positionFullName' },
      ]"
      submit-btn-name="btn.save"
      :is-loading="isSubmitting"
      :delete="true"
      @submit="handleSubmit"
      @close="handleCancel"
      @delete="handleDelete"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
