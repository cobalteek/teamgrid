<script setup lang="ts">
import { useEmployeeStore } from '../stores/employee'
import { useOrganizationStore } from '~/stores/organization'
import type { CreateEmployee } from '~~/types/employee'
import type { SalaryFormType } from '~~/types/salary'
import { normalizeSalaryAmount } from '~~/types/salary'
import { isValidEmail, isValidName, isValidPosition } from '~~/shared/utils/validation'
import { useErrorModal } from '#imports'

type EmployeeFormModel = Omit<CreateEmployee, 'salaryType' | 'salaryAmount'> & {
  salaryType: SalaryFormType
  salaryAmount: number | string | null
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close' | 'submit'): void
}>()

const employeeStore = useEmployeeStore()
const organizationStore = useOrganizationStore()
const useInit = useInitializeApp()
const isSubmitting = ref(false)

const employee = ref<EmployeeFormModel>({
  name: '',
  surname: '',
  middlename: '',
  position: '',
  email: '',
  organizationId: 0,
  salaryType: 'inherit',
  salaryAmount: '',
})

function resetEmployee() {
  const orgId = organizationStore.currentOrganization?.id
  if (orgId === undefined) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.organization.notFound',
    })
  }
  employee.value = {
    name: '',
    surname: '',
    middlename: '',
    position: '',
    email: '',
    organizationId: orgId,
    salaryType: 'inherit',
    salaryAmount: '',
  }
}

function getEmployeePayload(): CreateEmployee {
  const salaryType = employee.value.salaryType === 'inherit' ? null : employee.value.salaryType

  return {
    ...employee.value,
    salaryType,
    salaryAmount: salaryType ? normalizeSalaryAmount(employee.value.salaryAmount) : null,
  }
}

const handleCancel = () => {
  resetEmployee()
  emit('close')
}

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

const errorModal = useErrorModal()

const handleSubmit = async () => {
  if (employee.value.name === '') {
    errorModal.showError('error.form.nameEmpty')
    return
  }
  if (employee.value.email === '') {
    errorModal.showError('error.form.emailEmpty')
    return
  }
  if (!isValidEmail(employee.value.email)) {
    errorModal.showError('error.auth.emailInvalid')
    return
  }
  if (
    !isValidName(employee.value.name) ||
    (employee.value.surname.length > 0 && !isValidName(employee.value.surname)) ||
    (employee.value.middlename.length > 0 && !isValidName(employee.value.middlename))
  ) {
    errorModal.showError('error.auth.fullNameLength')
    return
  }
  if (employee.value.position.length > 0 && !isValidPosition(employee.value.position)) {
    errorModal.showError('error.auth.positionLength')
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
    await employeeStore.createEmployee(getEmployeePayload())
    resetEmployee()
    emit('submit')
    emit('close')
  } catch (e: unknown) {
    isSubmitting.value = false
    const error = e as {
      statusCode?: number
      status?: number
      data?: {
        statusCode?: number
        statusMessage?: string
        message?: string
      }
    }

    const status = error.statusCode ?? error.status ?? error.data?.statusCode

    if (status === 409) {
      errorModal.showError(error.data?.statusMessage ?? 'error.createEmployee')
    } else {
      errorModal.showError('error.createEmployee')
    }
  } finally {
    await useInit.init()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && organizationStore.currentOrganizationId !== null) {
      isSubmitting.value = false
      employee.value.organizationId = organizationStore.currentOrganizationId
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      v-model:model-value="employee"
      title="btn.addEmployee"
      :fields="[
        { key: 'name', type: 'text', placeholder: 'placeholder.firstName', required: true },
        { key: 'surname', type: 'text', placeholder: 'placeholder.lastName' },
        { key: 'middlename', type: 'text', placeholder: 'placeholder.middleName' },
        { key: 'position', type: 'text', placeholder: 'placeholder.position' },
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
          key: 'organizationId',
          placeholder: 'select.organization',
          disabledOption: 'select.organization',
          selectOption: organizationStore.options,
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
      submit-btn-name="btn.addEmployee"
      :is-loading="isSubmitting"
      @close="handleCancel"
      @submit="handleSubmit"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
