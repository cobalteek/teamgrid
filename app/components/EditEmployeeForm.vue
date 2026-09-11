<script setup lang="ts">
import Modal from './Modal.vue'
import {useEmployeeStore} from '~/stores/employee'
import {usePositionStore} from '~/stores/position'
import { useOrganizationStore } from '~/stores/organization';
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
const organizationStore = useOrganizationStore()

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
  if(employee.value.id &&
    (!isValidName(employee.value.name) ||
    (employee.value.surname && !isValidName(employee.value.surname)) ||
    (employee.value.middlename && !isValidName(employee.value.middlename)))
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

    emit('submit')
    emit('close')
  } catch(e) {
    console.log(e)
  } finally {
    await initApp.init()
  }
}

function handleCancel() {
  emit('close')
}

async function handleDelete() {
  const isManager = await organizationStore.isManager()

  if(!isManager) {
    showError('error.onlyManager')
    return
  }

  try {
    await employeeStore.deleteEmployee(employee.value.id)
    emit('close')
  } catch(e) {
    showError(e as string)
    console.error(e)
  } finally {
    await initApp.init()
  }
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
    class="max-h-[calc(100vh-10rem)] overflow-y-auto w-[300px]"
      v-if="employee"
      title="ui.employeeEdit"
      :fields="[
          { key: 'name', type: 'text', placeholder: 'placeholder.firstName' },
          { key: 'surname', type: 'text', placeholder: 'placeholder.lastName' },
          { key: 'middlename', type: 'text', placeholder: 'placeholder.middleName' },
          { key: 'email', type: 'email', placeholder: 'placeholder.email' }
        ]"
        :comboboxes="[{
          key:'position.id',
          placeholder: 'select.position',
          selectOption: positionStore.options
        }]"
        v-model:modelValue="employee"
        submitBtnName="btn.save"
        :is-loading="employeeStore.isLoading"
        :delete="true"
        @submit="handleSubmit"
        @close="handleCancel"
        @delete="handleDelete"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
  />
</template>