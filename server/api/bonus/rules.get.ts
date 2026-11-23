import { createError, defineEventHandler, getQuery } from 'h3'
import { isMonthKey } from '~~/types/bonus'
import { getFormulaVariables } from '~~/server/utils/bonus'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const query = getQuery(event)
  const organizationId = Number(query.organizationId)
  const month = String(query.month || '')

  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    throw createError({ statusCode: 400, statusMessage: t('error.organization.notFound') })
  }
  if (month && !isMonthKey(month)) {
    throw createError({ statusCode: 400, statusMessage: t('error.bonus.invalidMonth') })
  }

  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const rules = await prisma.bonusRule.findMany({
    where: { organizationId },
    orderBy: [{ scope: 'asc' }, { name: 'asc' }],
    include: {
      position: { select: { id: true, name: true, fullName: true } },
      employee: { select: { id: true, name: true, surname: true, middlename: true } },
      months: month ? { where: { month }, select: { variables: true } } : false,
    },
  })

  return rules.map((rule) => {
    const variables = rule.months[0]?.variables
    return {
      id: rule.id,
      name: rule.name,
      scope: rule.scope,
      formula: rule.formula,
      variableNames: getFormulaVariables(rule.formula),
      positionId: rule.positionId,
      employeeId: rule.employeeId,
      position: rule.position,
      employee: rule.employee,
      variables:
        variables && typeof variables === 'object' && !Array.isArray(variables) ? variables : {},
    }
  })
})
