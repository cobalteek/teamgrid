<script setup lang="ts">
import { useErrorModal } from '#imports'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '../stores/employee'
import { usePositionStore } from '../stores/position'
import { useShiftStore } from '../stores/shift'
import { useUserSettingsStore } from '~/stores/userSettings'
import type { CreateShift, ScheduleTemplate } from '~~/types/shift'
import { formatDateStr } from '~~/shared/utils/formatDate'
import { isRussianFiveTwoHoliday } from '~~/shared/utils/russianHolidays'

type ShiftDateInfo = {
  dateStr: string
  date: Date
}

const props = defineProps<{
  modelValue: boolean
  info: ShiftDateInfo
  employeeId?: string
}>()

const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const shiftStore = useShiftStore()
const userSettingsStore = useUserSettingsStore()
const { settings: userSettings } = storeToRefs(userSettingsStore)

const errorModal = useErrorModal()
const isSubmitting = ref(false)

const advancedSettings = ref(false)
const templateEnabled = ref(false)
const justShift = ref(false)

const formWidthClass = computed(() =>
  advancedSettings.value
    ? 'transition-all duration-350 sm:w-[725px]'
    : 'transition-all duration-350 sm:w-[450px]',
)

const createShift = ref<CreateShift>({
  date: props.info.dateStr,
  employeeId: '',
  positionId: 0,
  allDay: true,
})

function applyEmployeeSelection(employeeId?: string) {
  createShift.value.employeeId = employeeId ?? ''

  if (!employeeId) {
    createShift.value.positionId = 0
    return
  }

  createShift.value.positionId =
    employeeStore.employees.find((employee) => employee.id === employeeId)?.position.id ?? 0
}

applyEmployeeSelection(props.employeeId)

const template = ref<ScheduleTemplate>({
  workDays: 0,
  restDays: 0,
  endDate: props.info.dateStr ?? new Date().toISOString().split('T')[0] ?? '',
  weekdays: [] as number[],
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close' | 'submit'): void
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
  createShift.value.date = props.info.dateStr
  applyEmployeeSelection(props.employeeId)
  createShift.value.allDay = true
  createShift.value.startTime = undefined
  createShift.value.endTime = undefined

  template.value.endDate = props.info.dateStr ?? new Date().toISOString().split('T')[0] ?? ''
  template.value.restDays = 0
  template.value.workDays = 0
  template.value.weekdays = []
  justShift.value = false
}

const handleCancel = () => {
  resetModal()
  emit('close')
}

const handleSubmit = async () => {
  if (!createShift.value.date) {
    errorModal.showError('error.form.fieldsEmpty')
    return
  }

  if (
    createShift.value.employeeId === '' &&
    createShift.value.positionId === 0 &&
    !justShift.value
  ) {
    errorModal.showError('error.form.fieldsEmpty')
    return
  }

  if (justShift.value) {
    createShift.value.employeeId = null
    createShift.value.positionId = null
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
    const hasWeekdays = Boolean(template.value.weekdays?.length)
    const hasCycle = template.value.workDays > 0

    if (!template.value.endDate || (!hasWeekdays && !hasCycle)) {
      errorModal.showError('error.form.fieldsEmpty')
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
    if (!shifts || shifts.length === 0) {
      errorModal.showError('error.form.shiftsEmpty')
      return
    }

    isSubmitting.value = true

    try {
      await shiftStore.createManyShifts(shifts)
      emit('submit')
      resetModal()
      emit('close')
    } catch (error: unknown) {
      isSubmitting.value = false
      errorModal.showError(error instanceof Error ? error.message : 'error.shift.create')
    }
    return
  }

  isSubmitting.value = true

  try {
    await shiftStore.createShift(createShift.value)
    emit('submit')
    resetModal()
    emit('close')
  } catch (error: unknown) {
    isSubmitting.value = false
    errorModal.showError(error instanceof Error ? error.message : 'error.shift.create')
    return
  }
}

function toggleAdvancedSettings() {
  advancedSettings.value = !advancedSettings.value
}

function isFiveTwoTemplate(template: ScheduleTemplate) {
  if (template.workDays === 5 && template.restDays === 2) return true

  return (
    template.weekdays?.length === 5 &&
    [1, 2, 3, 4, 5].every((weekday) => template.weekdays?.includes(weekday))
  )
}

function shouldSkipRussianHoliday(date: Date, template: ScheduleTemplate) {
  return (
    userSettings.value.excludeRussianFiveTwoHolidays &&
    isFiveTwoTemplate(template) &&
    isRussianFiveTwoHoliday(date, true)
  )
}

function generateShifts(createShift: CreateShift, template: ScheduleTemplate) {
  const newShifts: CreateShift[] = []

  let daysPassed = 0

  if (template.weekdays && template.weekdays.length > 0) {
    const date = new Date(`${createShift.date}T00:00:00Z`)
    const endDate = new Date(`${template.endDate}T00:00:00Z`)

    while (date <= endDate) {
      const dayOfWeek = date.getUTCDay() === 0 ? 7 : date.getUTCDay()

      if (template.weekdays.includes(dayOfWeek) && !shouldSkipRussianHoliday(date, template)) {
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
      date.setUTCDate(date.getUTCDate() + 1)
    }

    return newShifts
  }

  const date = new Date(`${createShift.date}T00:00:00Z`)
  const endDate = new Date(`${template.endDate}T00:00:00Z`)

  const cycleLength = template.workDays + template.restDays

  while (date <= endDate) {
    const cyclePosition = daysPassed % cycleLength

    if (cyclePosition < template.workDays && !shouldSkipRussianHoliday(date, template)) {
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

    date.setUTCDate(date.getUTCDate() + 1)
  }

  return newShifts
}

function toggleJustShift() {
  justShift.value = !justShift.value
  if (justShift.value) {
    createShift.value.employeeId = ''
  } else {
    createShift.value.positionId = 0
  }
}

watch(
  () => createShift.value.employeeId,
  (employeeId) => {
    if (!employeeId) {
      createShift.value.positionId = 0
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
      createShift.value.date = props.info.dateStr
      applyEmployeeSelection(props.employeeId)
      justShift.value = false
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Form
      v-model="createShift"
      :class="formWidthClass"
      title="btn.addShift"
      :fields="[
        {
          key: 'date',
          type: 'date',
          placeholder: 'ui.shiftDate',
          required: true,
        },
      ]"
      :selects="[
        {
          key: 'employeeId',
          placeholder: 'select.employee',
          disabledOption: 'select.employee',
          selectOption: employeeStore.options,
          disabled: justShift,
        },
        {
          key: 'positionId',
          placeholder: 'select.position',
          placeholderValue: 0,
          disabledOption: 'select.position',
          selectOption: positionStore.options,
          disabled: justShift,
        },
      ]"
      submit-btn-name="btn.addShift"
      :is-loading="isSubmitting"
      @submit="handleSubmit"
      @close="handleCancel"
    >
      <template #before-actions>
        <label
          class="mt-2 flex w-full cursor-pointer items-start gap-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-left text-sm leading-5 transition hover:border-[var(--text-blue)]"
        >
          <input type="checkbox" class="peer sr-only" @change="toggleJustShift" />
          <span
            aria-hidden="true"
            class="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--input-border)] bg-[var(--bg-modal)] transition peer-checked:border-[var(--btn-bg)] peer-checked:bg-[var(--btn-bg)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--text-blue)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg-modal)] after:h-2 after:w-3 after:rotate-[-45deg] after:border-b-2 after:border-l-2 after:border-[var(--btn-text)] after:opacity-0 after:transition-opacity peer-checked:after:opacity-100"
          />
          <span class="w-full select-none"> {{ $t('ui.justShift') }} </span>
        </label>
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
          <Transition
            enter-active-class="overflow-hidden transition-all duration-200 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[900px] opacity-100"
            leave-active-class="overflow-hidden transition-all duration-200 ease-in"
            leave-from-class="max-h-[900px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="advancedSettings" class="border-t border-[var(--border-main)] pt-3">
              <ShiftTemplate
                v-model:model-value="template"
                v-model:shift="createShift"
                v-model:template-enabled="templateEnabled"
                :date="info.date"
              />
            </div>
          </Transition>
        </div>
      </template>
    </Form>
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
