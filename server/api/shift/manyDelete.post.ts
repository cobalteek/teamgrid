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

  const hasDateRange = Boolean(startDate && endDate)
  const hasEmployees = Array.isArray(employeeIds) && employeeIds.length > 0
  const hasPositions = Array.isArray(positionIds) && positionIds.length > 0
  const shouldDeleteAll = deleteAll === true

  if (!shouldDeleteAll && !hasDateRange && !hasEmployees && !hasPositions) {
    throw createError({ statusCode: 400, statusMessage: 'error.bulk.notFound' })
  }

  if (Boolean(startDate) !== Boolean(endDate)) {
    throw createError({ statusCode: 400, statusMessage: 'error.form.dateRangeRequired' })
  }

  const start = hasDateRange ? new Date(`${startDate}T00:00:00Z`) : null
  const end = hasDateRange ? new Date(`${endDate}T00:00:00Z`) : null

  if (
    start &&
    end &&
    (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'error.form.startOlderEnd' })
  }

  const dayAfterEndDate = end ? new Date(end.getTime() + 24 * 60 * 60 * 1000) : null
  const where = {
    organizationId,
    ...(!shouldDeleteAll && start && dayAfterEndDate
      ? { date: { gte: start, lt: dayAfterEndDate } }
      : {}),
    ...(!shouldDeleteAll && hasEmployees ? { employeeId: { in: employeeIds } } : {}),
    ...(!shouldDeleteAll && hasPositions ? { positionId: { in: positionIds } } : {}),
  }

  const result = await prisma.shift.deleteMany({ where })

  return {
    success: true,
    deletedCount: result.count,
  }
})
