<script setup lang="ts">
import Modal from './Modal.vue'
import { useEmployeeStore } from '~/stores/employee'
import { isValidEmail, isValidName } from '~~/shared/utils/validation'
import type { Employee } from '~~/types/employee'

const props = defineProps<{
  modelValue: boolean
  employeeId: string
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
const errorModal = useErrorModal()
const initApp = useInitializeApp()
const employeeStore = useEmployeeStore()
const isSubmitting = ref(false)
const isDeleteEmployeeConfirmModalOpen = ref(false)
const selectedEmployeeConfirmDelete = ref('')
const withShifts = ref(false)

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
    fullName: '',
  },
  organization: {
    id: 0,
    name: '',
  },
})

async function handleSubmit() {
  if (
    employee.value.id &&
    (!isValidName(employee.value.name) ||
      (employee.value.surname && !isValidName(employee.value.surname)) ||
      (employee.value.middlename && !isValidName(employee.value.middlename)))
  ) {
    errorModal.showError('error.invalidName')
    return
  }
  if (employee.value && !isValidEmail(employee.value.email)) {
    errorModal.showError('error.invalidEmail')
    return
  }

  isSubmitting.value = true

  try {
    await employeeStore.changeEmployee(employee.value)

    emit('submit')
    emit('close')
    resetModal()
  } catch (e) {
    isSubmitting.value = false
    console.log(e)
  } finally {
    await initApp.init()
  }
}

function handleCancel() {
  emit('close')
  resetModal()
}

function confirmDelete() {
  selectedEmployeeConfirmDelete.value = `${$t('ui.employeeConfrimDelete') + ' ' + employee.value.surname + ' ' + employee.value.name + '?'}`
  isDeleteEmployeeConfirmModalOpen.value = true
}

async function handleDelete() {
  isSubmitting.value = true

  try {
    await employeeStore.deleteEmployee(employee.value.id, withShifts.value)
    emit('close')
    resetModal()
  } catch (e) {
    isSubmitting.value = false
    errorModal.showError(e as string)
    console.error(e)
  } finally {
    await initApp.init()
  }
}

const resetModal = () => {
  isSubmitting.value = false
  withShifts.value = false
  employee.value = {
    id: '',
    name: '',
    surname: '',
    middlename: '',
    email: '',
    color: '',
    position: {
      id: 0,
      name: '',
      fullName: '',
    },
    organization: {
      id: 0,
      name: '',
    },
  }
  selectedEmployeeConfirmDelete.value = ''
  isDeleteEmployeeConfirmModalOpen.value = false
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isSubmitting.value = false
      const _employee = employeeStore.employees.find((employee) => employee.id === props.employeeId)

      if (_employee) {
        employee.value = {
          ..._employee,
          position: { ..._employee.position },
          organization: { ..._employee.organization },
        }
      }
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      v-if="employee"
      v-model:model-value="employee"
      title="ui.employeeEdit"
      :fields="[
        { key: 'name', type: 'text', placeholder: 'placeholder.firstName', required: true },
        { key: 'surname', type: 'text', placeholder: 'placeholder.lastName' },
        { key: 'middlename', type: 'text', placeholder: 'placeholder.middleName' },
        { key: 'email', type: 'email', placeholder: 'placeholder.email', required: true },
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
    :model-value="isDeleteEmployeeConfirmModalOpen"
    :message="selectedEmployeeConfirmDelete"
    :is-loading="isSubmitting"
    :checkboxes="[{ text: 'ui.deleteShiftsEmployeeToo', required: true, model: withShifts }]"
    submit-text="btn.delete"
    @update:checkbox="withShifts = $event"
    @submit="handleDelete"
    @close="isDeleteEmployeeConfirmModalOpen = false"
  />
</template>
