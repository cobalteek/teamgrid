<script setup lang="ts">
import { useErrorModal } from '#imports';
import { useEmployeeStore } from '../stores/employee';
import { usePositionStore } from '../stores/position';
import { useShiftStore } from '../stores/shift';
import type { Shift } from '../../types/shift';
const props = defineProps<{
    modelValue: boolean
    info: any
}>()

const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const shiftStore = useShiftStore()

onMounted(async () => {
    await employeeStore.getEmployees()
    await positionStore.getPositions()
})

const shift = ref<Shift>({
    id: '',
    date: new Date(),
    employeeId: '',
    positionId: 0
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close') : void
  (e: 'submit') : void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

const handleCancel = () => {
  emit('close')
}

const handleSubmit = async () => {
  console.log('shift.value', shift.value)
    if(shift.value.employeeId === '' || shift.value.positionId === 0) {
        useErrorModal().showError('error.form.fieldsEmpty')
        return
    }
    console.log('shift.value', shift.value)
    await shiftStore.createShift(shift.value)
    emit('submit')
    emit('close')
}

const errorModal = useErrorModal()

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
            {key: 'employeeId', placeholder: $t('select.employee'), disabledOption: 'select.employee', selectOption: employeeStore.options},
            {key: 'positionId', placeholder: $t('select.position'), disabledOption: 'select.position', selectOption: positionStore.options}    
        ]"
        v-model:modelValue="shift"
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