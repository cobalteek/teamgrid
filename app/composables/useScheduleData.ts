import { storeToRefs } from 'pinia'
import type { ComputedRef } from 'vue'
import { useEmployeeStore } from '~/stores/employee'
import { usePositionStore } from '~/stores/position'
import { useShiftStore } from '~/stores/shift'
import type { ScheduleDay, ScheduleRow, PositionStat } from '~~/types/schedule'
import type { Employee } from '~~/types/employee'
import type { SalaryType } from '~~/types/salary'
import type { ShiftWithRelations } from '~~/types/shift'

type ScheduleDataOptions = {
  localeCode: ComputedRef<string>
  monthDays: ComputedRef<ScheduleDay[]>
  monthStartKey: ComputedRef<string>
  monthEndKey: ComputedRef<string>
}

export function useScheduleData({
  localeCode,
  monthDays,
  monthStartKey,
  monthEndKey,
}: ScheduleDataOptions) {
  const { t } = useI18n()
  const employeeStore = useEmployeeStore()
  const positionStore = usePositionStore()
  const shiftStore = useShiftStore()
  const { employees } = storeToRefs(employeeStore)
  const { positions } = storeToRefs(positionStore)
  const { shifts } = storeToRefs(shiftStore)

  const employeeQuery = ref('')
  const selectedPositionId = ref('')

  function employeeName(employee: Pick<Employee, 'surname' | 'name' | 'middlename'>) {
    return [employee.surname, employee.name, employee.middlename].filter(Boolean).join(' ')
  }

  function compareNames(a: string, b: string) {
    return a.localeCompare(b, localeCode.value, { sensitivity: 'base', numeric: true })
  }

  function shiftDateKey(shift: ShiftWithRelations) {
    return new Date(shift.date).toISOString().split('T')[0] ?? ''
  }

  function shiftPositionLabel(shift: ShiftWithRelations) {
    return shift.position?.name || t('schedule.noPosition')
  }

  function shiftDurationHours(shift: ShiftWithRelations) {
    if (shift.allDay || shift.startTime === null || shift.endTime === null) return 0

    const duration = shift.endTime - shift.startTime
    return duration > 0 ? duration / 60 : 0
  }

  const positionOptions = computed(() =>
    [...positions.value].sort((a, b) => compareNames(a.fullName, b.fullName)),
  )

  const orderedEmployees = computed(() =>
    [...employees.value].sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || compareNames(employeeName(a), employeeName(b)),
    ),
  )

  const monthShifts = computed(() =>
    shifts.value.filter((shift) => {
      const dateKey = shiftDateKey(shift)
      const isInMonth = dateKey >= monthStartKey.value && dateKey <= monthEndKey.value
      const matchesPosition =
        !selectedPositionId.value || String(shift.position?.id) === selectedPositionId.value

      return isInMonth && matchesPosition
    }),
  )

  const visibleShifts = computed(() => {
    const query = employeeQuery.value.trim().toLocaleLowerCase(localeCode.value)

    if (!query) return monthShifts.value

    return monthShifts.value.filter((shift) => {
      const employeeLabel = shift.employee?.id
        ? `${employeeName(shift.employee)} ${shift.employee.position?.fullName || ''}`
        : t('schedule.unassigned')

      return employeeLabel.toLocaleLowerCase(localeCode.value).includes(query)
    })
  })

  const rows = computed<ScheduleRow[]>(() => {
    const query = employeeQuery.value.trim().toLocaleLowerCase(localeCode.value)
    const employeeIdsWithSelectedPositionShift = new Set(
      monthShifts.value
        .map((shift) => shift.employee?.id)
        .filter((employeeId): employeeId is string => Boolean(employeeId)),
    )
    const employeeRows: ScheduleRow[] = orderedEmployees.value
      .filter(
        (employee) =>
          !selectedPositionId.value || employeeIdsWithSelectedPositionShift.has(employee.id),
      )
      .map((employee) => ({
        id: employee.id,
        label: employeeName(employee),
        positionLabel: employee.position?.fullName || '',
        color: employee.color || 'var(--text-blue)',
      }))
      .filter((employee) => {
        if (!query) return true
        return `${employee.label} ${employee.positionLabel}`
          .toLocaleLowerCase(localeCode.value)
          .includes(query)
      })

    const hasUnassignedShifts = visibleShifts.value.some((shift) => !shift.employee?.id)

    if (
      hasUnassignedShifts &&
      (!query || t('schedule.unassigned').toLocaleLowerCase(localeCode.value).includes(query))
    ) {
      employeeRows.push({
        id: '__unassigned__',
        label: t('schedule.unassigned'),
        positionLabel: '',
        color: 'var(--text-muted)',
        isUnassigned: true,
      })
    }

    return employeeRows
  })

  const shiftsByCell = computed(() => {
    const result = new Map<string, ShiftWithRelations[]>()

    visibleShifts.value.forEach((shift) => {
      const rowId = shift.employee?.id || '__unassigned__'
      const key = `${rowId}:${shiftDateKey(shift)}`
      const cellShifts = result.get(key) ?? []
      cellShifts.push(shift)
      result.set(key, cellShifts)
    })

    result.forEach((cellShifts) => {
      cellShifts.sort((a, b) => {
        return (
          (a.startTime ?? Number.MAX_SAFE_INTEGER) - (b.startTime ?? Number.MAX_SAFE_INTEGER) ||
          compareNames(a.position?.name || '', b.position?.name || '')
        )
      })
    })

    return result
  })

  function totalHours(cellShifts: ShiftWithRelations[]) {
    return cellShifts.reduce((total, shift) => total + shiftDurationHours(shift), 0)
  }

  function salaryConfigForShift(shift: ShiftWithRelations) {
    if (shift.employee?.salaryType === 'none') {
      return { type: 'none' as const, amount: 0 }
    }

    if (shift.employee?.salaryType && shift.employee.salaryAmount !== null) {
      return {
        type: shift.employee.salaryType as SalaryType,
        amount: shift.employee.salaryAmount,
      }
    }

    if (shift.position?.salaryType && shift.position.salaryAmount !== null) {
      return {
        type: shift.position.salaryType as SalaryType,
        amount: shift.position.salaryAmount,
      }
    }

    return null
  }

  const salaryByEmployee = computed(() => {
    const result = new Map<string, number>()
    const configuredEmployees = new Set<string>()
    const monthlyEmployees = new Set<string>()

    visibleShifts.value.forEach((shift) => {
      const employeeId = shift.employee?.id
      const config = salaryConfigForShift(shift)

      if (!employeeId || !config) return

      configuredEmployees.add(employeeId)

      if (config.type === 'monthly') {
        if (monthlyEmployees.has(employeeId)) return

        monthlyEmployees.add(employeeId)
        result.set(employeeId, config.amount)
        return
      }

      const shiftSalary =
        config.type === 'hourly' ? shiftDurationHours(shift) * config.amount : config.amount

      result.set(employeeId, (result.get(employeeId) ?? 0) + shiftSalary)
    })

    return { result, configuredEmployees }
  })

  function rowHours(row: ScheduleRow) {
    return monthDays.value.reduce(
      (total, day) => total + totalHours(shiftsByCell.value.get(`${row.id}:${day.key}`) ?? []),
      0,
    )
  }

  function rowSalary(row: ScheduleRow) {
    if (!salaryByEmployee.value.configuredEmployees.has(row.id)) return null

    return salaryByEmployee.value.result.get(row.id) ?? 0
  }

  function dayHours(day: ScheduleDay) {
    return rows.value.reduce(
      (total, row) => total + totalHours(shiftsByCell.value.get(`${row.id}:${day.key}`) ?? []),
      0,
    )
  }

  const totalHoursValue = computed(() => totalHours(visibleShifts.value))
  const totalSalaryValue = computed(() =>
    Array.from(salaryByEmployee.value.result.values()).reduce((total, salary) => total + salary, 0),
  )

  const positionStats = computed<PositionStat[]>(() => {
    const stats = new Map<string, number>()

    visibleShifts.value.forEach((shift) => {
      const name = shiftPositionLabel(shift)
      stats.set(name, (stats.get(name) ?? 0) + shiftDurationHours(shift))
    })

    return Array.from(stats.entries())
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours || compareNames(a.name, b.name))
  })

  function formatHours(hours: number) {
    return `${hours.toLocaleString(localeCode.value, { maximumFractionDigits: 1 })} ${t('schedule.hoursShort')}`
  }

  function formatMoney(amount: number) {
    return new Intl.NumberFormat(localeCode.value, {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return {
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
  }
}
