<script setup lang="ts">
import Modal from './Modal.vue'
import { useEmployeeStore } from '~/stores/employee'
import { usePositionStore } from '~/stores/position'
import { isValidEmail, isValidName } from '~~/shared/utils/validation'
import type { Employee } from '~~/types/employee'
import type { SalaryFormType } from '~~/types/salary'
import { normalizeSalaryAmount } from '~~/types/salary'

type EmployeeFormModel = Omit<Employee, 'salaryType' | 'salaryAmount'> & {
  salaryType: SalaryFormType
  salaryAmount: number | string | null
}

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
const positionStore = usePositionStore()

const isSubmitting = ref(false)
const isDeleteEmployeeConfirmModalOpen = ref(false)
const selectedEmployeeConfirmDelete = ref('')
const withShifts = ref(false)

const employee = ref<EmployeeFormModel>({
  id: '',
  name: '',
  surname: '',
  middlename: '',
  email: '',
  color: '',
  sortOrder: 0,
  position: {
    id: 0,
    name: '',
    fullName: '',
  },
  organization: {
    id: 0,
    name: '',
  },
  salaryType: 'inherit',
  salaryAmount: '',
})

function getEmployeePayload(): Employee {
  const salaryType = employee.value.salaryType === 'inherit' ? null : employee.value.salaryType
  const positionId = employee.value.position.id
  return {
    ...employee.value,
    positionId,
    salaryType,
    salaryAmount: salaryType ? normalizeSalaryAmount(employee.value.salaryAmount) : null,
  }
}

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
  if (
    employee.value.salaryType !== 'inherit' &&
    employee.value.salaryType !== 'none' &&
    normalizeSalaryAmount(employee.value.salaryAmount) === null
  ) {
    errorModal.showError('error.salary.invalid')
    return
  }

  isSubmitting.value = true

  try {
    await employeeStore.changeEmployee(getEmployeePayload())

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
    sortOrder: 0,
    position: {
      id: 0,
      name: '',
      fullName: '',
    },
    organization: {
      id: 0,
      name: '',
    },
    salaryType: 'inherit',
    salaryAmount: '',
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
          salaryType: _employee.salaryType ?? 'inherit',
          salaryAmount: _employee.salaryAmount ?? '',
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
        {
          key: 'salaryAmount',
          type: 'number',
          placeholder: 'salary.amount',
          disabled: employee.salaryType === 'inherit' || employee.salaryType === 'none',
        },
      ]"
      :selects="[
        {
          key: 'position.id',
          placeholder: 'ui.position',
          disabledOption: 'ui.position',
          selectOption: positionStore.positions.map((position) => ({
            value: position.id,
            label: position.name,
          })),
        },
        {
          key: 'salaryType',
          placeholder: 'salary.typeLabel',
          disabledOption: 'salary.typeLabel',
          selectOption: [
            { value: 'inherit', label: $t('salary.inheritPosition') },
            { value: 'none', label: $t('salary.noPay') },
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
