import { createError, defineEventHandler, getRouterParam, getQuery, readBody } from 'h3'
import { parseBonusRule } from '~~/server/utils/bonus'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const organizationId = Number(getQuery(event).organizationId)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<Record<string, unknown>>(event)

  if (!Number.isInteger(organizationId) || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: t('error.bonus.invalidRule') })
  }
  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const existing = await prisma.bonusRule.findFirst({ where: { id, organizationId } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: t('error.bonus.notFound') })

  const rule = parseBonusRule(body || {})
  if (rule.scope === 'position') {
    const position = await prisma.position.findFirst({
      where: { id: rule.positionId!, organizationId },
    })
    if (!position)
      throw createError({ statusCode: 400, statusMessage: t('error.bonus.targetRequired') })
  }
  if (rule.scope === 'employee') {
    const employee = await prisma.employee.findFirst({
      where: { id: rule.employeeId!, organizationId },
    })
    if (!employee)
      throw createError({ statusCode: 400, statusMessage: t('error.bonus.targetRequired') })
  }

  return prisma.bonusRule.update({
    where: { id },
    data: {
      name: rule.name,
      scope: rule.scope,
      formula: rule.formula,
      positionId: rule.positionId,
      employeeId: rule.employeeId,
    },
  })
})
