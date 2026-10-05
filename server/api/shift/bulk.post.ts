import { prisma } from '~~/server/utils/prisma'
import { defineEventHandler, createError, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const body = await readBody(event)
  const shifts = body?.shifts
  const organizationId = Number(body?.organizationId)

  if (!Array.isArray(shifts) || shifts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: t('error.bulk.notFound') })
  }
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
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
    if (
      !shift ||
      !shift.date ||
      typeof shift.employeeId !== 'string' ||
      !shift.employeeId ||
      !Number.isInteger(shift.positionId)
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.shift.requiredFields'),
      })
    }

    if (Number.isNaN(new Date(shift.date).getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: t('error.shift.notFound'),
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

  const employeeIds = [...new Set(shifts.map((shift) => shift.employeeId))]
  const positionIds = [...new Set(shifts.map((shift) => shift.positionId))]
  const [employees, positions] = await Promise.all([
    prisma.employee.findMany({
      where: { id: { in: employeeIds }, organizationId },
      select: { id: true },
    }),
    prisma.position.findMany({
      where: { id: { in: positionIds }, organizationId },
      select: { id: true },
    }),
  ])

  if (employees.length !== employeeIds.length || positions.length !== positionIds.length) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.shift.notFound'),
    })
  }

  try {
    const createdShifts = await prisma.$transaction(
      shifts.map((shift) => {
        const allDay = shift.allDay !== false
        return prisma.shift.create({
          data: {
            date: shift.date,
            employeeId: shift.employeeId,
            positionId: shift.positionId,
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
