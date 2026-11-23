import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const organizationId = Number(getQuery(event).organizationId)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(organizationId) || !Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: t('error.bonus.notFound') })
  }
  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const rule = await prisma.bonusRule.findFirst({ where: { id, organizationId } })
  if (!rule) throw createError({ statusCode: 404, statusMessage: t('error.bonus.notFound') })

  await prisma.bonusRule.delete({ where: { id } })
  return { success: true }
})
