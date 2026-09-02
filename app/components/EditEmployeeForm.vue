<script setup lang="ts">
import Modal from './Modal.vue'
import {useEmployeeStore} from '~/stores/employee'
import {usePositionStore} from '~/stores/position'
import { isValidEmail , isValidName,} from '~~/shared/utils/validation';
import type { Employee } from '~~/types/employee';

const props = defineProps<{
  modelValue: boolean
  employeeId: string
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
const errorModal = useErrorModal()
const initApp = useInitializeApp()
const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const employee = ref<Employee>({
  id: '',
  name: '',
  surname: '',
  middlename: '',
  email: '',
  color: '',
  position: {
    id: 0,
    name: '',
    fullName: ''
  },
  organization: {
    id: 0,
    name: ''
  }
})

async function handleSubmit() {
  if(employee.value &&
    (!isValidName(employee.value.name) ||
    !isValidName(employee.value.surname) ||
    !isValidName(employee.value.middlename))
    ) {
    errorModal.showError('error.invalidName')
    return
  }
  if(employee.value && !isValidEmail(employee.value.email)) {
    errorModal.showError('error.invalidEmail')
    return
  }
  try {
    await employeeStore.changeEmployee(employee.value)
  } catch(e) {
    console.log(e)
  } finally {
    await initApp.init()
  }
  emit('submit')
  emit('close')
}

function handleCancel() {
  emit('close')
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if(isOpen) {
      const _employee = employeeStore.employees.find(
        employee => employee.id === props.employeeId
      )

      if(_employee) {
        employee.value = _employee
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
      v-if="employee"
      title="ui.employeeEdit"
      :fields="[
          { key: 'name', type: 'text', placeholder: 'placeholder.firstName' },
          { key: 'surname', type: 'text', placeholder: 'placeholder.lastName' },
          { key: 'middlename', type: 'text', placeholder: 'placeholder.middleName' },
          { key: 'email', type: 'email', placeholder: 'placeholder.email' }
        ]"
        :selects="[{
          key:'position.id',
          placeholder: 'select.position',
          disabledOption: 'select.position',
          selectOption: positionStore.optionsFull
        }]"
        v-model:modelValue="employee"
        submitBtnName="btn.editEmployee"
        :is-loading="employeeStore.isLoading"
        @submit="handleSubmit"
        @close="handleCancel"
    />
  </Modal>
</template>