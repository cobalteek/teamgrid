import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)

  try {
    const shifts = await prisma.shift.findMany({
      select: {
        id: true,
        date: true,
        employeeId: true,
        positionId: true,
      }
    })

    if (!shifts || shifts.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.shift.notFound')
      })
    }

    return shifts.map((shift) => ({
      id: shift.id,
      date: shift.date,
      employeeId: shift.employeeId,
      positionId: shift.positionId
    }))

  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 404,
      statusMessage: t('error.api.notFound')
    })
  }
})