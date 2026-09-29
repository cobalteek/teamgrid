import { prisma } from '~~/server/utils/prisma'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const body = await readBody(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined

  const { date, employeeId, positionId } = body
  const allDay = body.allDay !== false
  const startTime = allDay ? null : body.startTime
  const endTime = allDay ? null : body.endTime

  if (!date || !employeeId || !positionId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('validation.shift.requiredFields'),
    })
  }

  if (
    !allDay &&
    (!Number.isInteger(startTime) ||
      !Number.isInteger(endTime) ||
      startTime < 0 ||
      startTime > 1439 ||
      endTime < 0 ||
      endTime > 1439 ||
      startTime >= endTime)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: t('validation.shift.invalidTime'),
    })
  }

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.get'),
    })
  }

  const isManager = await isManagerOrganization(userId, organizationId)

  if (!isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: t('error.onlyManager'),
    })
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, organizationId },
  })

  if (!employee) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.employee.notFound'),
    })
  }

  const position = await prisma.position.findUnique({
    where: { id: positionId, organizationId },
  })

  if (!position) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.position.notFound'),
    })
  }

  try {
    const shift = await prisma.shift.create({
      data: {
        date,
        employeeId,
        positionId,
        organizationId,
        allDay,
        startTime,
        endTime,
      },
      include: {
        employee: true,
        position: true,
        organization: true,
      },
    })

    return shift
  } catch (error) {
    console.error(error)

    throw error
  }
})
