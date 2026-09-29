import { prisma } from '~~/server/utils/prisma'
import { defineEventHandler, createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const body = await readBody(event)
  const { shifts, organizationId } = body

  if (!Array.isArray(shifts) || shifts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: t('error.bulk.notFound') })
  }
  if (!organizationId) {
    throw createError({ statusCode: 400, statusMessage: t('error.organization.get') })
  }

  const isManager = await isManagerOrganization(userId, organizationId)

  if (!isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: t('error.onlyManager'),
    })
  }

  for (const shift of shifts) {
    if (!shift.date || !shift.employeeId || !shift.positionId) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.shift.requiredFields'),
      })
    }

    const allDay = shift.allDay !== false
    if (
      !allDay &&
      (!Number.isInteger(shift.startTime) ||
        !Number.isInteger(shift.endTime) ||
        shift.startTime < 0 ||
        shift.startTime > 1439 ||
        shift.endTime < 0 ||
        shift.endTime > 1439 ||
        shift.startTime >= shift.endTime)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.shift.invalidTime'),
      })
    }
  }
  try {
    const createdShifts = await prisma.$transaction(
      shifts.map((shift) => {
        const allDay = shift.allDay !== false
        return prisma.shift.create({
          data: {
            ...shift,
            organizationId,
            allDay,
            startTime: allDay ? null : shift.startTime,
            endTime: allDay ? null : shift.endTime,
          },
          include: { employee: true, position: true, organization: true },
        })
      }),
    )
    return createdShifts
  } catch (error) {
    console.error(error)
    throw error
  }
})
