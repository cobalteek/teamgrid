<script setup lang="ts">
import Modal from './Modal.vue'
import { usePositionStore } from '~/stores/position'
import type { Position } from '~~/types/position'
import type { SalaryFormType } from '~~/types/salary'
import { isValidPosition } from '~~/shared/utils/validation'
import { normalizeSalaryAmount } from '~~/types/salary'

type PositionFormModel = Omit<Position, 'salaryType' | 'salaryAmount'> & {
  salaryType: SalaryFormType
  salaryAmount: number | string | null
}

const props = defineProps<{
  modelValue: boolean
  positionId: number
}>()

function createEmptyPosition(): PositionFormModel {
  return {
    id: 0,
    name: '',
    fullName: '',
    organization: {
      id: 0,
      name: '',
    },
    color: '',
    salaryType: 'none',
    salaryAmount: '',
  }
}

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
const positionStore = usePositionStore()
const position = ref<PositionFormModel>(createEmptyPosition())

const withShifts = ref(false)

const errorModal = useErrorModal()
const initApp = useInitializeApp()
const isSubmitting = ref(false)

const selectedPositionConfirmDelete = ref('')
const isDeletePositionConfirmModalOpen = ref(false)

const resetModal = () => {
  position.value = createEmptyPosition()
  withShifts.value = false
  isSubmitting.value = false
}

function getPositionPayload(): Position {
  const salaryType =
    position.value.salaryType === 'none' || position.value.salaryType === 'inherit'
      ? null
      : position.value.salaryType

  return {
    ...position.value,
    salaryType,
    salaryAmount: salaryType ? normalizeSalaryAmount(position.value.salaryAmount) : null,
  }
}

async function handleSubmit() {
  if (!isValidPosition(position.value.name) || !isValidPosition(position.value.fullName)) {
    errorModal.showError('error.invalidName')
    return
  }

  if (
    position.value.salaryType !== 'none' &&
    normalizeSalaryAmount(position.value.salaryAmount) === null
  ) {
    errorModal.showError('error.salary.invalid')
    return
  }

  isSubmitting.value = true

  try {
    await positionStore.changePosition(getPositionPayload())
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

function confirmDelete() {
  selectedPositionConfirmDelete.value = `${$t('ui.positionfrimDelete') + ' ' + position.value.name + ' ' + position.value.fullName + '?'}`
  isDeletePositionConfirmModalOpen.value = true
}

async function handleDelete() {
  isSubmitting.value = true

  try {
    await positionStore.deletePosition(position.value.id, withShifts.value)
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
          salaryType: _position.salaryType ?? 'none',
          salaryAmount: _position.salaryAmount ?? '',
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
        { key: 'name', type: 'text', placeholder: 'placeholder.positionName', required: true },
        { key: 'fullName', type: 'text', placeholder: 'placeholder.positionFullName' },
        {
          key: 'salaryAmount',
          type: 'number',
          placeholder: 'salary.amount',
          disabled: position.salaryType === 'none',
        },
      ]"
      :selects="[
        {
          key: 'salaryType',
          placeholder: 'salary.typeLabel',
          disabledOption: 'salary.typeLabel',
          selectOption: [
            { value: 'none', label: $t('salary.none') },
            { value: 'hourly', label: $t('salary.hourly') },
            { value: 'per_shift', label: $t('salary.perShift') },
            { value: 'monthly', label: $t('salary.monthly') },
          ],
        },
      ]"
      submit-btn-name="btn.save"
      :is-loading="isSubmitting"
      :delete="true"
      @submit="handleSubmit"
      @close="handleCancel"
      @delete="confirmDelete"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
  <Confirm
    :model-value="isDeletePositionConfirmModalOpen"
    :message="selectedPositionConfirmDelete"
    :is-loading="isSubmitting"
    :checkboxes="[{ text: 'ui.deleteShiftsPositionToo', required: true, model: withShifts }]"
    submit-text="btn.delete"
    @update:checkbox="withShifts = $event"
    @submit="handleDelete"
    @close="isDeletePositionConfirmModalOpen = false"
  />
</template>
