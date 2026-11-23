import { createError, defineEventHandler, getQuery, readBody } from 'h3'
import { isMonthKey } from '~~/types/bonus'
import { parseBonusVariables } from '~~/server/utils/bonus'
import { getFormulaVariables } from '~~/server/utils/bonus'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const organizationId = Number(getQuery(event).organizationId)
  const body = await readBody<Record<string, unknown>>(event)
  const ruleId = Number(body.ruleId)
  const month = body.month

  if (!Number.isInteger(organizationId) || !Number.isInteger(ruleId) || !isMonthKey(month)) {
    throw createError({ statusCode: 400, statusMessage: t('error.bonus.invalidMonth') })
  }
  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const rule = await prisma.bonusRule.findFirst({ where: { id: ruleId, organizationId } })
  if (!rule) throw createError({ statusCode: 404, statusMessage: t('error.bonus.notFound') })

  const variableNames = getFormulaVariables(rule.formula)
  const variables = parseBonusVariables(body || {}, variableNames)

  return prisma.bonusMonth.upsert({
    where: { ruleId_month: { ruleId, month } },
    create: { ruleId, month, variables, organizationId },
    update: { variables },
  })
})
