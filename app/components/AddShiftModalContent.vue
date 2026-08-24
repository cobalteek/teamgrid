<script setup lang="ts">
import { useErrorModal } from '#imports';
import { useEmployeeStore } from '../stores/employee';
import { usePositionStore } from '../stores/position';
import { useShiftStore } from '../stores/shift';
import type { CreateShift } from '../../types/shift';
const props = defineProps<{
    modelValue: boolean
    info: any
}>()

const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const shiftStore = useShiftStore()
const errorModal = useErrorModal()

const createShift = ref<CreateShift>({
    date: '',
    employeeId: '',
    positionId: 1
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close') : void
  (e: 'submit') : void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    resetModal()
    emit('close')
  }
}

function resetModal() {
  createShift.value.employeeId = ''
  createShift.value.positionId = 1
}

const handleCancel = () => {
  resetModal()
  emit('close')
}

const handleSubmit = async () => {
  createShift.value.date = props.info.dateStr
  if(createShift.value.employeeId === '' || createShift.value.positionId === 0) {
      errorModal.showError('error.form.fieldsEmpty')
      return
  }
  try {
    const organizationStore = useOrganizationStore()
    await shiftStore.createShift(createShift.value, organizationStore.currentOrganizationId)
  } catch (error: any) {
      errorModal.showError(error.message || 'error.shift.create')
      return
  }
  emit('submit')
  resetModal()
  emit('close')
}

</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
  >
    <Form
        title="btn.addShift"
        :date="info.date"
        :selects="[
        {
          key: 'employeeId',
          placeholder: 'select.employee',
          disabledOption: 'select.employee',
          selectOption: employeeStore.options
        },
        {
          key: 'positionId',
          placeholder: 'select.position',
          disabledOption: 'select.position',
          selectOption: positionStore.options
        }
        ]"
        v-model="createShift"
        submitBtnName="btn.addShift"
        @submit="handleSubmit"
        @close="handleCancel"
    />
  </Modal>
  <ErrorModalContent
    :model-value="errorModal.isOpen.value"
    :type="errorModal.type.value"
    :text="errorModal.text.value"
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>