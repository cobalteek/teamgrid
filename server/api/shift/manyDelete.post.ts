import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { isManagerOrganization } from '~~/server/utils/member'
import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const { startDate, endDate, employeeIds, positionIds, deleteAll } = await readBody(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'error.auth.unAuth',
    })
  }

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.organization.notFound',
    })
  }

  const isManager = await isManagerOrganization(userId, organizationId)

  if (!isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: 'error.onlyManager',
    })
  }

  const _endDate = new Date(endDate)

  const dayAfterEndDate = new Date(_endDate.getTime() + 24 * 60 * 60 * 1000)

  await prisma.shift.deleteMany({
    where: {
      organizationId,
      ...(startDate &&
        endDate && {
          date: {
            gte: startDate,
            lt: dayAfterEndDate,
          },
        }),
      ...(employeeIds?.length && {
        employeeId: { in: employeeIds },
      }),
      ...(positionIds?.length && {
        positionId: { in: positionIds },
      }),
    },
  })

  return {
    success: true,
  }
})
