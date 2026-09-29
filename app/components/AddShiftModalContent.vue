<script setup lang="ts">
import { useErrorModal } from '#imports'
import { useEmployeeStore } from '../stores/employee'
import { usePositionStore } from '../stores/position'
import { useShiftStore } from '../stores/shift'
import type { CreateShift } from '~~/types/shift'
import type { ScheduleTemplate } from '~~/types/shift'
import { formatDateStr } from '~~/shared/utils/formatDate'
const props = defineProps<{
  modelValue: boolean
  info: any
}>()

const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const shiftStore = useShiftStore()
const { t } = useI18n()

const errorModal = useErrorModal()
const isSubmitting = ref(false)

const advancedSettings = ref(false)
const templateEnabled = ref(false)
const createShift = ref<CreateShift>({
  date: '',
  employeeId: '',
  positionId: positionStore.positions[0]?.id ? positionStore.positions[0].id : 1,
  allDay: true,
})

const template = ref<ScheduleTemplate>({
  workDays: 0,
  restDays: 0,
  endDate: props.info.dateStr ?? new Date().toISOString().split('T')[0] ?? '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
  (e: 'submit'): void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    resetModal()
    emit('close')
  }
}

function resetModal() {
  advancedSettings.value = false
  templateEnabled.value = false
  createShift.value.employeeId = ''
  createShift.value.positionId = 1
  createShift.value.allDay = true
  createShift.value.startTime = undefined
  createShift.value.endTime = undefined

  template.value.endDate = props.info.dateStr ?? new Date().toISOString().split('T')[0] ?? ''
  template.value.restDays = 0
  template.value.workDays = 0
}

const handleCancel = () => {
  resetModal()
  emit('close')
}

const handleSubmit = async () => {
  createShift.value.date = props.info.dateStr
  if (createShift.value.employeeId === '' || createShift.value.positionId === 0) {
    errorModal.showError('error.form.fieldsEmpty')
    return
  }
  if (!createShift.value.allDay) {
    if (
      createShift.value.startTime === undefined ||
      createShift.value.endTime === undefined ||
      createShift.value.startTime >= createShift.value.endTime
    ) {
      errorModal.showError('error.form.invalidShiftTime')
      return
    }
  }

  if (templateEnabled.value) {
    if (!template.value.endDate || !template.value.workDays) {
      errorModal.showError('error.form.fieldsEmpty')
      return
    }
    if (!template.value.restDays) {
      const confirmed = confirm(t('ui.noRestDays'))
      if (!confirmed) {
        return
      }
    }

    if (template.value.workDays === 0) {
      errorModal.showError('error.form.workDaysZero')
      return
    }

    if (
      new Date(`${createShift.value.date}T00:00:00Z`) >
      new Date(`${template.value.endDate}T00:00:00Z`)
    ) {
      errorModal.showError('error.form.startOlderEnd')
      return
    }

    const shifts = generateShifts(createShift.value, template.value)
    if (!shifts) {
      errorModal.showError('error.form.shiftsEmpty')
      return
    }

    isSubmitting.value = true

    try {
      await shiftStore.createManyShifts(shifts)
      emit('submit')
      resetModal()
      emit('close')
    } catch (error: any) {
      isSubmitting.value = false
      errorModal.showError(error.message || 'error.shift.create')
    }
    return
  }

  isSubmitting.value = true

  try {
    await shiftStore.createShift(createShift.value)
    emit('submit')
    resetModal()
    emit('close')
  } catch (error: any) {
    isSubmitting.value = false
    errorModal.showError(error.message || 'error.shift.create')
    return
  }
}

function toggleAdvancedSettings() {
  advancedSettings.value = !advancedSettings.value
}

function generateShifts(createShift: CreateShift, template: ScheduleTemplate) {
  const newShifts: CreateShift[] = []

  let daysPassed = 0

  let date = new Date(`${createShift.date}T00:00:00Z`)
  const endDate = new Date(`${template.endDate}T00:00:00Z`)

  const cycleLength = template.workDays + template.restDays

  while (date <= endDate) {
    const cyclePosition = daysPassed % cycleLength

    if (cyclePosition < template.workDays) {
      const dateStr = formatDateStr(date)
      if (!dateStr) {
        throw createError({
          statusCode: 400,
          statusMessage: 'error.invalidData',
        })
      }

      const newShift: CreateShift = {
        date: dateStr,
        employeeId: createShift.employeeId,
        positionId: createShift.positionId,
        allDay: createShift.allDay,
        startTime: createShift.startTime,
        endTime: createShift.endTime,
      }

      newShifts.push(newShift)
    }

    daysPassed++

    date.setDate(date.getDate() + 1)
  }

  return newShifts
}

watch(
  () => createShift.value.employeeId,
  (employeeId) => {
    if (!employeeId) {
      createShift.value.positionId = positionStore.positions[0]?.id
        ? positionStore.positions[0].id
        : 1
      return
    }

    const employee = employeeStore.employees.find((employee) => employee.id === employeeId)

    if (employee) {
      createShift.value.positionId = employee.position.id
    }
  },
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      isSubmitting.value = false
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      class="sm:w-[640px]"
      title="btn.addShift"
      :date="info.date"
      :selects="[
        {
          key: 'employeeId',
          placeholder: 'select.employee',
          disabledOption: 'select.employee',
          selectOption: employeeStore.options,
        },
        {
          key: 'positionId',
          placeholder: 'select.position',
          disabledOption: 'select.position',
          selectOption: positionStore.options,
        },
      ]"
      v-model="createShift"
      submitBtnName="btn.addShift"
      :is-loading="isSubmitting"
      @submit="handleSubmit"
      @close="handleCancel"
    >
      <template #before-actions>
        <div v-if="!isSubmitting" class="border-t border-[var(--border-main)] pt-3">
          <button
            type="button"
            class="flex min-h-11 w-full items-center justify-between text-left font-medium"
            :aria-expanded="advancedSettings"
            @click="toggleAdvancedSettings"
          >
            <span>{{ $t('ui.advancedSettings') }}</span>
            <span aria-hidden="true" class="text-xl font-normal">
              {{ advancedSettings ? '−' : '+' }}
            </span>
          </button>
          <ShiftTemplate
            v-if="advancedSettings"
            v-model:model-value="template"
            v-model:shift="createShift"
            v-model:template-enabled="templateEnabled"
            :date="info.date"
          />
        </div>
      </template>
    </Form>
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="top-1/4 h-[200px] w-[300px]"
  />
</template>
