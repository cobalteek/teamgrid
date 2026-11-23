<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ScheduleFilters from './schedule/ScheduleFilters.vue'
import ScheduleGrid from './schedule/ScheduleGrid.vue'
import ScheduleHeader from './schedule/ScheduleHeader.vue'
import ScheduleMetrics from './schedule/ScheduleMetrics.vue'
import type { ReorderEmployeesPayload } from '../../types/schedule.ts'
import { useEmployeeStore } from '~/stores/employee'
import { useOrganizationStore } from '~/stores/organization'
import { useShiftStore } from '~/stores/shift'
import { useVacationStore } from '~/stores/vacation'
import { useScheduleCalendar } from '~/composables/useScheduleCalendar'
import { useScheduleData } from '~/composables/useScheduleData'
import type { ShiftWithRelations } from '~~/types/shift'

const { locale, t } = useI18n()
const organizationStore = useOrganizationStore()
const employeeStore = useEmployeeStore()
const shiftStore = useShiftStore()
const vacationStore = useVacationStore()
const userSettingsStore = useUserSettingsStore()
const { isManager } = storeToRefs(organizationStore)
const { vacations } = storeToRefs(vacationStore)
const { settings: userSettings } = storeToRefs(userSettingsStore)
const { formatDate } = useUserDisplayPreferences()

const emit = defineEmits<{
  (event: 'add-shift', payload: { dateStr: string; employeeId: string }): void
}>()

const localeCode = computed(() => (locale.value === 'ru' ? 'ru-RU' : 'en-US'))
const { goToToday, monthDays, monthEndKey, monthStartKey, monthTitle, moveMonth } =
  useScheduleCalendar({
    localeCode,
    excludeRussianFiveTwoHolidays: computed(() => userSettings.value.excludeRussianFiveTwoHolidays),
  })
const data = useScheduleData({
  localeCode,
  monthDays,
  monthStartKey,
  monthEndKey,
})

const {
  employeeQuery,
  employeeName,
  formatHours,
  formatMoney,
  orderedEmployees,
  positionOptions,
  positionStats,
  rowHours,
  rowSalary,
  rows,
  selectedPositionId,
  shiftPositionLabel,
  shiftsByCell,
  totalHoursValue,
  totalSalaryValue,
  visibleShifts,
  dayHours,
} = data

const isReordering = ref(false)
const selectedShiftId = ref('')
const selectedShiftConfirmDelete = ref('')
const isDeleteShiftConfirmModalOpen = ref(false)
const isSubmitting = ref(false)
const errorModal = useErrorModal()

async function loadMonthVacations() {
  try {
    await vacationStore.getVacations({
      startDate: monthStartKey.value,
      endDate: monthEndKey.value,
    })
  } catch {
    // The schedule remains usable if the optional vacation layer fails to load.
  }
}

onMounted(loadMonthVacations)
watch([monthStartKey, monthEndKey], loadMonthVacations)

async function reorderEmployees({ draggedId, targetId, dropAfterTarget }: ReorderEmployeesPayload) {
  if (draggedId === targetId || isReordering.value) return

  const employeeIds = orderedEmployees.value.map((employee) => employee.id)
  const sourceIndex = employeeIds.indexOf(draggedId)
  const targetIndex = employeeIds.indexOf(targetId)

  if (sourceIndex === -1 || targetIndex === -1) return

  employeeIds.splice(sourceIndex, 1)
  const targetIndexAfterRemoval = employeeIds.indexOf(targetId)
  employeeIds.splice(targetIndexAfterRemoval + (dropAfterTarget ? 1 : 0), 0, draggedId)

  isReordering.value = true
  try {
    await employeeStore.reorderEmployees(employeeIds)
  } catch {
    await employeeStore.getEmployees()
  } finally {
    isReordering.value = false
  }
}

function openDeleteShiftConfirm(shift: ShiftWithRelations) {
  if (!isManager.value) return

  selectedShiftId.value = shift.id
  selectedShiftConfirmDelete.value = `${t('ui.shiftDeleteConfirm')} ${shiftPositionLabel(shift)} ${shift.employee ? employeeName(shift.employee) : t('schedule.unassigned')} ${formatDate(shift.date)}?`
  isDeleteShiftConfirmModalOpen.value = true
}

async function deleteShift() {
  if (!selectedShiftId.value) return

  isSubmitting.value = true
  try {
    await shiftStore.deleteShift(selectedShiftId.value)
  } catch {
    errorModal.showError('error.shift.delete')
  } finally {
    isSubmitting.value = false
    isDeleteShiftConfirmModalOpen.value = false
    selectedShiftId.value = ''
  }
}

function clearFilters() {
  employeeQuery.value = ''
  selectedPositionId.value = ''
}

function forwardAddShift(payload: { dateStr: string; employeeId: string }) {
  emit('add-shift', payload)
}
</script>

<template>
  <section class="min-w-0 space-y-4">
    <ScheduleHeader
      :month-title="monthTitle"
      @today="goToToday"
      @previous-month="moveMonth(-1)"
      @next-month="moveMonth(1)"
    />

    <ScheduleMetrics
      :total-hours="totalHoursValue"
      :shift-count="visibleShifts.length"
      :employee-count="rows.length"
      :total-salary="totalSalaryValue"
      :position-stats="positionStats"
      :format-hours="formatHours"
      :format-money="formatMoney"
    />

    <ScheduleFilters
      :employee-query="employeeQuery"
      :selected-position-id="selectedPositionId"
      :position-options="positionOptions"
      @update:employee-query="employeeQuery = $event"
      @update:selected-position-id="selectedPositionId = $event"
      @clear="clearFilters"
    />

    <ScheduleGrid
      :month-days="monthDays"
      :rows="rows"
      :shifts-by-cell="shiftsByCell"
      :vacations="vacations"
      :is-manager="isManager"
      :is-reordering="isReordering"
      :total-hours="totalHoursValue"
      :total-salary="totalSalaryValue"
      :row-hours="rowHours"
      :row-salary="rowSalary"
      :day-hours="dayHours"
      :format-hours="formatHours"
      :format-money="formatMoney"
      @add-shift="forwardAddShift"
      @delete-shift="openDeleteShiftConfirm"
      @reorder-employees="reorderEmployees"
    />

    <p v-if="shiftStore.isLoading" class="text-sm text-[var(--text-muted)]">
      {{ $t('ui.loading') }}
    </p>

    <Confirm
      v-if="isManager"
      :model-value="isDeleteShiftConfirmModalOpen"
      :message="selectedShiftConfirmDelete"
      :is-loading="isSubmitting"
      submit-text="btn.delete"
      @submit="deleteShift"
      @close="isDeleteShiftConfirmModalOpen = false"
    />
    <ErrorModalContent :error="errorModal.error.value" @close="errorModal.close" />
  </section>
</template>
