<script setup lang="ts">
import Modal from './Modal.vue'
import { usePositionStore } from '../stores/position';
import type {Position} from '~~/types/position'
import {isValidPosition} from '~~/shared/utils/validation'

const props = defineProps<{
  modelValue: boolean
  positionId: number
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

const positionStore = usePositionStore()
const position = ref<Position>({
  id: 0,
  name: '',
  fullName: '',
  organization: {
    id: 0,
    name: ''
  },
  color: ''
})
const errorModal = useErrorModal()
const initApp = useInitializeApp()

async function handleSubmit() {
  if(position.value &&
    (!isValidPosition(position.value.name) ||
    !isValidPosition(position.value.fullName))) {
    errorModal.showError('error.invalidName')
    return
  }
  try {
    await positionStore.changePosition(position.value)
  } catch(e) {
    console.log(e)
  } finally {
    await initApp.init()
  }
  
  emit('close')
}

function handleCancel() {
  emit('close')
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if(isOpen) {
      const _position = positionStore.positions.find(
        position => position.id === props.positionId
      )

      if(_position) {
        position.value = _position
      }
    }
  }
)

</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
  >
    <Form
      v-if="position"
      title="ui.positionEdit"
      :fields="[
        {key: 'name', type: 'text', placeholder: 'placeholder.position.name'},
        {key: 'fullName', type: 'text', placeholder: 'placeholder.position.fullName'},
        ]"
      v-model:model-value="position"
      submit-btn-name="btn.save"
      @submit="handleSubmit"
      @close="handleCancel"
    />
  </Modal>
</template>