<script setup lang="ts">
import { useEmployeeStore } from '~/stores/employee'
import type { CreateEmployee } from '~~/types/employee'
import { isValidEmail, isValidName, isValidPosition } from '../../server/utils/validation'
import { useErrorModal } from '#imports';

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close') : void
}>()

const employeeStore = useEmployeeStore()
const employee = ref<CreateEmployee>({
  name: '',
  surname: '',
  middlename: '',
  position: '',
  email: ''
})

const handleCancel = () => {
  resetEmployee()
  emit('close')
}

function resetEmployee() {
  employee.value = {
    name: '',
    surname: '',
    middlename: '',
    position: '',
    email: ''
  }
}

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

const errorModal = useErrorModal()

const handleSubmit = async () => {
  if(
    employee.value.name === '' ||
    employee.value.surname === '' ||
    employee.value.position === '' ||
    employee.value.email === ''
  ) {
    errorModal.showError('error.form.fieldsEmpty')
    return
  }
  if (!isValidEmail(employee.value.email)) {
    errorModal.showError('error.auth.emailInvalid')
    return
  }
  if (!isValidName(employee.value.name) || !isValidName(employee.value.surname) || (employee.value.middlename.length > 0 && !isValidName(employee.value.middlename))) {
    errorModal.showError('error.auth.fullNameLength')
    return
  }
  if (!isValidPosition(employee.value.position)) {
    errorModal.showError('error.auth.positionLength')
    return
  }
  try{
    await employeeStore.createEmployee(employee.value as CreateEmployee)
    resetEmployee()
  } catch (e) {
    const error = e as {statusCode?: number; status?: number; response?: {status?: number}}
    const status = error.statusCode || error.status || error.response?.status
    if (status === 401) {
      errorModal.showError('error.createEmployee')
    }
  }
  emit('close')
}

</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
    >
      <Form
        title="btn.addEmployee"
        :fields="[
          { key: 'name', type: 'text', placeholder: 'placeholder.firstName' },
          { key: 'surname', type: 'text', placeholder: 'placeholder.lastName' },
          { key: 'middlename', type: 'text', placeholder: 'placeholder.middleName' },
          { key: 'position', type: 'text', placeholder: 'placeholder.position' },
          { key: 'email', type: 'email', placeholder: 'placeholder.email' }
        ]"
        v-model:modelValue="employee"
        submitBtnName="btn.addEmployee"
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