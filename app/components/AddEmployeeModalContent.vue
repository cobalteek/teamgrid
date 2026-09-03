<script setup lang="ts">
import { useEmployeeStore } from '../stores/employee'
import { useOrganizationStore } from '~/stores/organization'
import type { CreateEmployee } from '~~/types/employee'
import { isValidEmail, isValidName, isValidPosition } from '~~/shared/utils/validation'
import { useErrorModal } from '#imports';

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close') : void
  (e: 'submit') : void
}>()

const employeeStore = useEmployeeStore()
const organizationStore = useOrganizationStore()
const useInit = useInitializeApp()

const employee = ref<CreateEmployee>({
  name: '',
  surname: '',
  middlename: '',
  position: '',
  email: '',
  organizationId: 1
})


function resetEmployee() {
  const orgId = organizationStore.currentOrganization?.id
  if (orgId === undefined) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.organization.notFound'
    })
  }
  employee.value = {
    name: '',
    surname: '',
    middlename: '',
    position: '',
    email: '',
    organizationId: orgId
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
  if(
    employee.value.name === '' ||
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
  if (!isValidName(employee.value.name) || (employee.value.surname.length > 0 && !isValidName(employee.value.surname)) || (employee.value.middlename.length > 0 && !isValidName(employee.value.middlename))) {
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
    emit('submit')
    emit('close')
  } catch (e: unknown) {
  const error = e as {
    statusCode?: number
    status?: number
    data?: {
      statusCode?: number
      statusMessage?: string
      message?: string
    }
  }

  const status =
    error.statusCode ??
    error.status ??
    error.data?.statusCode

  if (status === 409) {
    errorModal.showError(
      error.data?.statusMessage ?? 'error.createEmployee'
    )
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
            employee.value.organizationId =
                organizationStore.currentOrganizationId
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
        title="btn.addEmployee"
        :fields="[
          { key: 'name', type: 'text', placeholder: 'placeholder.firstName' },
          { key: 'surname', type: 'text', placeholder: 'placeholder.lastName' },
          { key: 'middlename', type: 'text', placeholder: 'placeholder.middleName' },
          { key: 'position', type: 'text', placeholder: 'placeholder.position' },
          { key: 'email', type: 'email', placeholder: 'placeholder.email' }
        ]"
        :selects="[{
          key:'organizationId',
          placeholder: 'select.organization',
          disabledOption: 'select.organization',
          selectOption: organizationStore.options
        }]"
        v-model:modelValue="employee"
        submitBtnName="btn.addEmployee"
        :is-loading="employeeStore.isLoading"
        @submit="handleSubmit"
        @close="handleCancel"
      />
  <Loading
    v-if="employeeStore.isLoading"
  />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>