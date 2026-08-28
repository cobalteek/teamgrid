<script setup lang="ts">
import { useErrorModal } from '#imports';
import { useEmployeeStore } from '../stores/employee';
import { usePositionStore } from '../stores/position';
import { useShiftStore } from '../stores/shift';
import type { CreateShift } from '../../types/shift';
import type { ScheduleTemplate } from '~~/types/shift';
import { formatDateStr } from '~~/shared/utils/formatDate';
const props = defineProps<{
    modelValue: boolean
    info: any
}>()

const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const shiftStore = useShiftStore()

const errorModal = useErrorModal()

const advancedSettings = ref(false)
const createShift = ref<CreateShift>({
    date: '',
    employeeId: '',
    positionId: positionStore.positions[0]?.id ? positionStore.positions[0].id : 1
})

const template = ref<ScheduleTemplate>({
  workDays: 0,
  restDays: 0,
  endDate: new Date()
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close') : void
  (e: 'submit') : void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    resetModal()
    emit('close')
  }
}

function resetModal() {
  createShift.value.employeeId = ''
  createShift.value.positionId = 1
}

const handleCancel = () => {
  resetModal()
  emit('close')
}

const handleSubmit = async () => {
  createShift.value.date = props.info.dateStr
  if(createShift.value.employeeId === '' || createShift.value.positionId === 0) {
      errorModal.showError('error.form.fieldsEmpty')
      return
  }
  if(advancedSettings.value) {
    if(!template.value.endDate ||
       !template.value.restDays ||
       !template.value.workDays
    ) {
      errorModal.showError('error.form.fieldsEmpty')
      return
    }

    const shifts = generateShifts(createShift.value, template.value)
    console.log('shiftGen' + shifts)
    if(!shifts?.value) {
      errorModal.showError('error.form.shiftsEmpty')
      return
    }
    await shiftStore.createManyShifts(shifts?.value)
  }
  try {
    await shiftStore.createShift(createShift.value)
  } catch (error: any) {
      errorModal.showError(error.message || 'error.shift.create')
      return
  }
  emit('submit')
  resetModal()
  emit('close')
}

function toggleAdvancedSettings() {
  advancedSettings.value = !advancedSettings.value
}

function generateShifts(
  createShift: CreateShift,
  template: ScheduleTemplate
) {
  const newShifts = ref<CreateShift[]>([])

  let daysPassed = 0
  let date = new Date(createShift.date)

  while (date <= template.endDate) {

    const cycleLength =
      template.workDays + template.restDays

    const cyclePosition =
      daysPassed % cycleLength

    if (cyclePosition < template.workDays) {

      const dateStr = formatDateStr(date)
      if(!dateStr) {
        return
      }

      const newShift: CreateShift = {
        date: dateStr,
        employeeId: createShift.employeeId,
        positionId: createShift.positionId
      }

      newShifts.value.push(newShift)
    }

    daysPassed++

    date.setDate(date.getDate() + 1)
  }

  console.log('newShifts' + newShifts.value)

  return newShifts
}

watch(
  () => createShift.value.employeeId,
  (employeeId) => {
    if(!employeeId) {
      createShift.value.positionId = positionStore.positions[0]?.id ? positionStore.positions[0].id : 1
      return
    }

    const employee = employeeStore.employees.find(
      employee => employee.id === employeeId
    )

    if(employee) {
      createShift.value.positionId = employee.position.id
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
        title="btn.addShift"
        :date="info.date"
        :selects="[
        {
          key: 'employeeId',
          placeholder: 'select.employee',
          disabledOption: 'select.employee',
          selectOption: employeeStore.options
        },
        {
          key: 'positionId',
          placeholder: 'select.position',
          disabledOption: 'select.position',
          selectOption: positionStore.options
        }
        ]"
        v-model="createShift"
        submitBtnName="btn.addShift"
        @submit="handleSubmit"
        @close="handleCancel"
    />
    <button
      class="pl-2 pb-2 underline cursor-pointer"
      @click="toggleAdvancedSettings"
    >
      {{$t('ui.advancedSettings')}}
    </button>
    <ShiftTemplate
      :date="info.date"
      v-if=advancedSettings
      v-model:model-value="template"
      class="pl-2 pb-2"
    />
    <Loading
    v-if="shiftStore.isLoading"
  />
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>