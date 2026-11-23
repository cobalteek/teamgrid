import { createError, defineEventHandler, getQuery } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { requireOrganizationRole } from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const body = await readBody(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const id = typeof body?.id === 'string' ? body.id : ''

  if (!organizationId || !id) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.vacation.notFound'),
    })
  }

  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const vacation = await prisma.vacation.findFirst({
    where: { id, organizationId },
    select: { id: true },
  })

  if (!vacation) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.vacation.notFound'),
    })
  }

  await prisma.vacation.delete({ where: { id } })

  return { success: true }
})
