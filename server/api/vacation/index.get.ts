import { createError, defineEventHandler, getQuery } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { requireOrganizationRole } from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const startDate = query.startDate ? new Date(`${String(query.startDate)}T00:00:00Z`) : undefined
  const endDate = query.endDate ? new Date(`${String(query.endDate)}T00:00:00Z`) : undefined

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.notFound'),
    })
  }

  if (
    (startDate && Number.isNaN(startDate.getTime())) ||
    (endDate && Number.isNaN(endDate.getTime())) ||
    (startDate && endDate && startDate > endDate)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.vacation.invalidDates'),
    })
  }

  await requireOrganizationRole(
    userId,
    organizationId,
    ['owner', 'admin', 'user'],
    t('error.onlyMember'),
  )

  const vacations = await prisma.vacation.findMany({
    where: {
      organizationId,
      ...(startDate && endDate
        ? {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          }
        : {}),
    },
    orderBy: [{ startDate: 'asc' }, { endDate: 'asc' }],
    select: {
      id: true,
      startDate: true,
      endDate: true,
      note: true,
      employeeId: true,
      employee: {
        select: {
          id: true,
          name: true,
          surname: true,
          middlename: true,
        },
      },
    },
  })

  return vacations
})
