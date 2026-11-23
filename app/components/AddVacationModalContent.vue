<script setup lang="ts">
import { useEmployeeStore } from '~/stores/employee'
import { useVacationStore } from '~/stores/vacation'
import type { CreateVacation } from '~~/types/vacation'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close' | 'submit'): void
}>()

const employeeStore = useEmployeeStore()
const vacationStore = useVacationStore()
const errorModal = useErrorModal()
const isSubmitting = ref(false)

function getErrorMessage(error: unknown) {
  if (typeof error !== 'object' || error === null) return 'error.vacation.notFound'

  const requestError = error as { data?: { message?: string }; message?: string }
  return requestError.data?.message || requestError.message || 'error.vacation.notFound'
}

function today() {
  return new Date().toISOString().split('T')[0] ?? ''
}

const vacation = ref<CreateVacation>({
  employeeId: '',
  startDate: today(),
  endDate: today(),
  note: '',
})

function resetForm() {
  vacation.value = {
    employeeId: '',
    startDate: today(),
    endDate: today(),
    note: '',
  }
  isSubmitting.value = false
}

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)
  if (!value) {
    resetForm()
    emit('close')
  }
}

async function handleSubmit() {
  if (
    !vacation.value.employeeId ||
    !vacation.value.startDate ||
    !vacation.value.endDate ||
    vacation.value.startDate > vacation.value.endDate
  ) {
    errorModal.showError('error.vacation.invalidDates')
    return
  }

  isSubmitting.value = true

  try {
    await vacationStore.createVacation(vacation.value)
    emit('submit')
    resetForm()
    emit('close')
  } catch (error: unknown) {
    isSubmitting.value = false
    errorModal.showError(getErrorMessage(error))
  }
}

function handleCancel() {
  resetForm()
  emit('close')
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      v-model:model-value="vacation"
      title="schedule.addVacation"
      :fields="[
        { key: 'startDate', type: 'date', placeholder: 'schedule.vacationStart', required: true },
        { key: 'endDate', type: 'date', placeholder: 'schedule.vacationEnd', required: true },
        { key: 'note', type: 'text', placeholder: 'schedule.vacationNote' },
      ]"
      :selects="[
        {
          key: 'employeeId',
          placeholder: 'select.employee',
          disabledOption: 'select.employee',
          selectOption: employeeStore.options,
          required: true,
        },
      ]"
      submit-btn-name="schedule.addVacation"
      :is-loading="isSubmitting"
      @submit="handleSubmit"
      @close="handleCancel"
    />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
