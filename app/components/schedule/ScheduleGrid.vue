<script setup lang="ts">
import ScheduleShiftCard from './ScheduleShiftCard.vue'
import type { ReorderEmployeesPayload, ScheduleDay, ScheduleRow } from '../../../types/schedule.ts'
import type { ShiftWithRelations } from '~~/types/shift'
import type { Vacation } from '~~/types/vacation'

const props = defineProps<{
  monthDays: ScheduleDay[]
  rows: ScheduleRow[]
  shiftsByCell: Map<string, ShiftWithRelations[]>
  vacations: Vacation[]
  isManager: boolean
  isReordering: boolean
  totalHours: number
  totalSalary: number
  rowHours: (row: ScheduleRow) => number
  rowSalary: (row: ScheduleRow) => number | null
  dayHours: (day: ScheduleDay) => number
  formatHours: (hours: number) => string
  formatMoney: (amount: number) => string
}>()

const emit = defineEmits<{
  (event: 'add-shift', payload: { dateStr: string; employeeId: string }): void
  (event: 'delete-shift', shift: ShiftWithRelations): void
  (event: 'reorder-employees', payload: ReorderEmployeesPayload): void
}>()

const draggedEmployeeId = ref<string | null>(null)
const dragOverEmployeeId = ref<string | null>(null)
const pointerDragId = ref<number | null>(null)
const pointerSourceEmployeeId = ref<string | null>(null)
const pointerStart = ref({ x: 0, y: 0 })
const isPointerDragging = ref(false)

function clearDragState() {
  draggedEmployeeId.value = null
  dragOverEmployeeId.value = null
}

function stopPointerTracking() {
  document.removeEventListener('pointermove', onDocumentPointerMove)
  document.removeEventListener('pointerup', onDocumentPointerUp)
  document.removeEventListener('pointercancel', cancelPointerDrag)
}

function cancelPointerDrag() {
  stopPointerTracking()
  pointerDragId.value = null
  pointerSourceEmployeeId.value = null
  isPointerDragging.value = false
  clearDragState()
}

function findEmployeeRow(employeeId: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('tr[data-employee-id]')).find(
    (row) => row.dataset.employeeId === employeeId,
  )
}

function onPointerDown(event: PointerEvent, row: ScheduleRow) {
  if (!props.isManager || row.isUnassigned || props.isReordering) return

  event.preventDefault()
  pointerDragId.value = event.pointerId
  pointerSourceEmployeeId.value = row.id
  pointerStart.value = { x: event.clientX, y: event.clientY }
  isPointerDragging.value = false
  document.addEventListener('pointermove', onDocumentPointerMove)
  document.addEventListener('pointerup', onDocumentPointerUp)
  document.addEventListener('pointercancel', cancelPointerDrag)
}

function onDocumentPointerMove(event: PointerEvent) {
  if (pointerDragId.value !== event.pointerId || !pointerSourceEmployeeId.value) return

  const distance = Math.hypot(
    event.clientX - pointerStart.value.x,
    event.clientY - pointerStart.value.y,
  )

  if (!isPointerDragging.value && distance < 8) return

  if (!isPointerDragging.value) {
    isPointerDragging.value = true
    draggedEmployeeId.value = pointerSourceEmployeeId.value
  }

  event.preventDefault()

  const row = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest<HTMLElement>('tr[data-employee-id]')
  const targetEmployeeId = row?.dataset.employeeId

  dragOverEmployeeId.value =
    targetEmployeeId &&
    targetEmployeeId !== pointerSourceEmployeeId.value &&
    targetEmployeeId !== '__unassigned__'
      ? targetEmployeeId
      : null
}

function onDocumentPointerUp(event: PointerEvent) {
  if (pointerDragId.value !== event.pointerId) return

  const draggedId = pointerSourceEmployeeId.value
  const targetId = dragOverEmployeeId.value
  const targetElement = targetId ? findEmployeeRow(targetId) : undefined
  const dropAfterTarget = targetElement
    ? event.clientY > targetElement.getBoundingClientRect().top + targetElement.offsetHeight / 2
    : false
  const shouldReorder = isPointerDragging.value && draggedId && targetId

  cancelPointerDrag()

  if (shouldReorder) {
    emit('reorder-employees', {
      draggedId,
      targetId,
      dropAfterTarget,
    })
  }
}

function shiftsForCell(row: ScheduleRow, day: ScheduleDay) {
  return props.shiftsByCell.get(`${row.id}:${day.key}`) ?? []
}

function vacationDateKey(value: string) {
  return value.split('T')[0] ?? value
}

function vacationsForCell(row: ScheduleRow, day: ScheduleDay) {
  if (row.isUnassigned) return []

  return props.vacations.filter((vacation) => {
    return (
      vacation.employeeId === row.id &&
      vacationDateKey(vacation.startDate) <= day.key &&
      vacationDateKey(vacation.endDate) >= day.key
    )
  })
}

function isShiftOnVacation(shift: ShiftWithRelations) {
  const employeeId = shift.employee?.id
  if (!employeeId) return false

  const dateKey = new Date(shift.date).toISOString().split('T')[0] ?? ''

  return props.vacations.some((vacation) => {
    return (
      vacation.employeeId === employeeId &&
      vacationDateKey(vacation.startDate) <= dateKey &&
      vacationDateKey(vacation.endDate) >= dateKey
    )
  })
}

function openShiftForCell(row: ScheduleRow, day: ScheduleDay) {
  if (!props.isManager || row.isUnassigned) return

  emit('add-shift', {
    dateStr: day.key,
    employeeId: row.id,
  })
}

onUnmounted(cancelPointerDrag)
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-context)]"
  >
    <div class="overflow-x-auto">
      <table class="min-w-[1320px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th
              scope="col"
              class="sticky left-0 z-30 min-w-56 border-r border-b border-[var(--border-main)] bg-[var(--input-bg)] px-4 py-3 text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >
              {{ $t('schedule.employee') }}
            </th>
            <th
              v-for="day in props.monthDays"
              :key="day.key"
              scope="col"
              class="min-w-36 border-b border-[var(--border-main)] px-3 py-3 text-center"
              :class="[day.isToday ? 'bg-[var(--primary)]/20' : 'bg-[var(--input-bg)]']"
            >
              <span
                class="block text-[11px] font-semibold tracking-wide uppercase"
                :class="[
                  day.date.getDay() === 6 || day.date.getDay() === 0 || day.isHoliday
                    ? 'text-[var(--btn-delete-text)]'
                    : 'text-[var(--text-muted)]',
                ]"
              >
                {{ day.weekday }}
              </span>
              <span
                class="mt-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-bold"
                :class="day.isToday ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-main)]'"
              >
                {{ day.number }}
              </span>
            </th>
            <th
              scope="col"
              class="min-w-28 border-b border-l border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-3 text-center text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >
              {{ $t('schedule.total') }}
            </th>
            <th
              scope="col"
              class="sticky right-0 z-30 min-w-32 border-b border-l border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-3 text-center text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >
              {{ $t('schedule.salary') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in props.rows"
            :key="row.id"
            :data-employee-id="row.isUnassigned ? undefined : row.id"
            class="group transition-colors"
            :class="[
              draggedEmployeeId === row.id ? 'opacity-50' : '',
              dragOverEmployeeId === row.id ? 'bg-[var(--bg-hover-context)]' : '',
            ]"
          >
            <th
              scope="row"
              class="sticky left-0 z-20 min-w-56 border-r border-b border-[var(--border-main)] bg-[var(--bg-context)] px-4 py-3 text-left align-top group-hover:bg-[var(--bg-hover-context)]"
              :class="[
                props.isManager && !row.isUnassigned && !props.isReordering
                  ? 'cursor-grab active:cursor-grabbing'
                  : '',
                draggedEmployeeId === row.id ? 'cursor-grabbing' : '',
              ]"
              @pointerdown="onPointerDown($event, row)"
            >
              <div class="flex min-w-0 items-start gap-2">
                <span
                  v-if="props.isManager && !row.isUnassigned"
                  class="mt-0.5 flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] active:cursor-grabbing"
                  :class="props.isReordering ? 'pointer-events-none opacity-50' : ''"
                  :title="$t('schedule.dragToReorder')"
                  :aria-label="$t('schedule.dragToReorder')"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    aria-hidden="true"
                  >
                    <path d="M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01" />
                  </svg>
                </span>
                <span
                  class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: row.color }"
                  aria-hidden="true"
                />
                <span class="min-w-0">
                  <span
                    class="block truncate text-sm font-semibold text-[var(--text-main)]"
                    :title="row.label"
                  >
                    {{ row.label }}
                  </span>
                  <span
                    v-if="row.positionLabel"
                    class="mt-0.5 block truncate text-xs text-[var(--text-muted)]"
                  >
                    {{ row.positionLabel }}
                  </span>
                </span>
              </div>
            </th>
            <td
              v-for="day in props.monthDays"
              :key="`${row.id}-${day.key}`"
              class="min-w-36 border-b border-[var(--border-main)] p-1.5 align-top"
              :class="[
                day.isToday ? 'bg-[var(--primary)]/5' : '',
                props.isManager && !row.isUnassigned
                  ? 'cursor-pointer transition-colors hover:bg-[var(--bg-hover-context)]'
                  : '',
              ]"
              @click="openShiftForCell(row, day)"
            >
              <div v-if="vacationsForCell(row, day).length" class="mb-1 space-y-1">
                <div
                  v-for="vacation in vacationsForCell(row, day)"
                  :key="vacation.id"
                  class="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-amber-800 dark:text-amber-200"
                  :title="vacation.note || $t('schedule.vacation')"
                  @click.stop
                >
                  <div class="text-xs font-bold">{{ $t('schedule.vacation') }}</div>
                  <div v-if="vacation.note" class="mt-0.5 truncate text-[11px] opacity-80">
                    {{ vacation.note }}
                  </div>
                </div>
              </div>
              <div v-if="shiftsForCell(row, day).length" class="space-y-1">
                <ScheduleShiftCard
                  v-for="shift in shiftsForCell(row, day)"
                  :key="shift.id"
                  :shift="shift"
                  :is-on-vacation="isShiftOnVacation(shift)"
                  @delete="$emit('delete-shift', $event)"
                />
              </div>
              <span v-else class="block px-1 py-2 text-center text-xs text-[var(--text-muted)]/40"
                >—</span
              >
            </td>
            <td
              class="min-w-28 border-b border-l border-[var(--border-main)] bg-[var(--bg-context)] px-3 py-3 text-center text-sm font-bold text-[var(--text-main)] group-hover:bg-[var(--bg-hover-context)]"
            >
              {{ props.formatHours(props.rowHours(row)) }}
            </td>
            <td
              class="sticky right-0 z-20 min-w-32 border-b border-l border-[var(--border-main)] bg-[var(--bg-context)] px-3 py-3 text-center text-sm font-bold text-[var(--text-main)] group-hover:bg-[var(--bg-hover-context)]"
            >
              {{
                props.rowSalary(row) !== null
                  ? props.formatMoney(props.rowSalary(row) ?? 0)
                  : $t('schedule.noSalary')
              }}
            </td>
          </tr>
          <tr v-if="!props.rows.length">
            <td
              :colspan="props.monthDays.length + 3"
              class="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
            >
              {{ $t('schedule.empty') }}
            </td>
          </tr>
        </tbody>
        <tfoot v-if="props.rows.length">
          <tr>
            <th
              scope="row"
              class="sticky bottom-0 left-0 z-20 min-w-56 border-r border-[var(--border-main)] bg-[var(--input-bg)] px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >
              {{ $t('schedule.totalPerDay') }}
            </th>
            <td
              v-for="day in props.monthDays"
              :key="`total-${day.key}`"
              class="sticky bottom-0 z-10 min-w-36 border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-3 text-center text-xs font-bold text-[var(--text-soft)]"
            >
              {{ props.formatHours(props.dayHours(day)) }}
            </td>
            <td
              class="min-w-28 border-l border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-3 text-center text-sm font-bold text-[var(--text-main)]"
            >
              {{ props.formatHours(props.totalHours) }}
            </td>
            <td
              class="sticky right-0 bottom-0 z-30 min-w-32 border-l border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-3 text-center text-sm font-bold text-[var(--text-main)]"
            >
              {{ props.formatMoney(props.totalSalary) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
