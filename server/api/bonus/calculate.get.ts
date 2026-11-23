import { createError, defineEventHandler, getQuery } from 'h3'
import { isMonthKey } from '~~/types/bonus'
import { evaluateFormula, getFormulaVariables } from '~~/server/utils/bonus'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { prisma } from '~~/server/utils/prisma'

function shiftHours(startTime: number | null, endTime: number | null, allDay: boolean) {
  if (allDay || startTime === null || endTime === null || endTime <= startTime) return 0
  return (endTime - startTime) / 60
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const query = getQuery(event)
  const organizationId = Number(query.organizationId)
  const month = String(query.month || '')

  if (!Number.isInteger(organizationId) || organizationId <= 0 || !isMonthKey(month)) {
    throw createError({ statusCode: 400, statusMessage: t('error.bonus.invalidMonth') })
  }
  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const startDate = new Date(`${month}-01T00:00:00.000Z`)
  const endDate = new Date(startDate)
  endDate.setUTCMonth(endDate.getUTCMonth() + 1)

  const [employees, shifts, rules] = await Promise.all([
    prisma.employee.findMany({
      where: { organizationId },
      orderBy: [{ sortOrder: 'asc' }, { surname: 'asc' }, { name: 'asc' }],
      include: {
        position: {
          select: { id: true, name: true, fullName: true, salaryType: true, salaryAmount: true },
        },
      },
    }),
    prisma.shift.findMany({
      where: { organizationId, date: { gte: startDate, lt: endDate }, employeeId: { not: null } },
      select: {
        date: true,
        employeeId: true,
        allDay: true,
        startTime: true,
        endTime: true,
        position: { select: { salaryType: true, salaryAmount: true } },
      },
    }),
    prisma.bonusRule.findMany({
      where: { organizationId },
      include: { months: { where: { month }, select: { variables: true } } },
      orderBy: { id: 'asc' },
    }),
  ])

  const rows = employees.map((employee) => {
    const employeeShifts = shifts.filter((shift) => shift.employeeId === employee.id)
    const hours = employeeShifts.reduce(
      (total, shift) => total + shiftHours(shift.startTime, shift.endTime, shift.allDay),
      0,
    )
    const days = new Set(employeeShifts.map((shift) => shift.date.toISOString().slice(0, 10))).size
    const employeeSalaryType = employee.salaryType
    const baseConfig = employeeSalaryType
      ? { type: employeeSalaryType, amount: employee.salaryAmount }
      : employee.position?.salaryType
        ? { type: employee.position.salaryType, amount: employee.position.salaryAmount }
        : null

    let baseSalary = 0
    if (baseConfig?.type === 'monthly' && baseConfig.amount !== null) baseSalary = baseConfig.amount

    for (const shift of employeeShifts) {
      const config = employeeSalaryType
        ? { type: employeeSalaryType, amount: employee.salaryAmount }
        : { type: shift.position?.salaryType, amount: shift.position?.salaryAmount }
      if (!config.amount || config.type === 'monthly' || config.type === 'none' || !config.type)
        continue
      baseSalary +=
        config.type === 'hourly'
          ? shiftHours(shift.startTime, shift.endTime, shift.allDay) * config.amount
          : config.amount
    }

    const matchingRules = rules.filter((rule) =>
      rule.scope === 'employee'
        ? rule.employeeId === employee.id
        : rule.scope === 'position'
          ? rule.positionId === employee.positionId
          : rule.scope === 'organization',
    )
    const selectedRule =
      matchingRules.find((rule) => rule.scope === 'employee') ||
      matchingRules.find((rule) => rule.scope === 'position') ||
      matchingRules.find((rule) => rule.scope === 'organization') ||
      null

    let bonus = 0
    let missingVariables: string[] = []
    if (selectedRule) {
      const monthVariables = selectedRule.months[0]?.variables
      const variables = {
        salary: baseSalary,
        hours,
        shifts: employeeShifts.length,
        days,
        ...(monthVariables && typeof monthVariables === 'object' && !Array.isArray(monthVariables)
          ? monthVariables
          : {}),
      } as Record<string, number>
      missingVariables = getFormulaVariables(selectedRule.formula).filter(
        (name) => variables[name] === undefined,
      )
      if (!missingVariables.length) {
        try {
          bonus = Math.max(
            0,
            Math.round(evaluateFormula(selectedRule.formula, variables) * 100) / 100,
          )
        } catch {
          missingVariables = getFormulaVariables(selectedRule.formula)
        }
      }
    }

    return {
      employeeId: employee.id,
      employeeName: [employee.surname, employee.name, employee.middlename]
        .filter(Boolean)
        .join(' '),
      positionName: employee.position?.fullName || '',
      baseSalary: Math.round(baseSalary * 100) / 100,
      bonus,
      total: Math.round((baseSalary + bonus) * 100) / 100,
      rule: selectedRule
        ? {
            id: selectedRule.id,
            name: selectedRule.name,
            scope: selectedRule.scope,
            formula: selectedRule.formula,
          }
        : null,
      missingVariables,
    }
  })

  return {
    month,
    rows,
    totalBaseSalary: rows.reduce((total, row) => total + row.baseSalary, 0),
    totalBonus: rows.reduce((total, row) => total + row.bonus, 0),
    total: rows.reduce((total, row) => total + row.total, 0),
  }
})
