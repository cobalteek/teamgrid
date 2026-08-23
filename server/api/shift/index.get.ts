import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const query = getQuery(event)
  const employeeId = query.employeeId ? String(query.employeeId) : undefined
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  try {
    const where = {
      organizationId,
      ...(employeeId && { employeeId })
    }
    const shifts = await prisma.shift.findMany({
      where,
      select: {
        id: true,
        date: true,
        employeeId: true,
        positionId: true,

        employee: {
          select: {
            id: true,
            name: true,
            surname: true,
            middlename: true,
            positionId: true,
            email: true
          }
        },

        position: {
          select: {
            id: true,
            name: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
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
      positionId: shift.positionId,
      employee: {
        id: shift.employee.id,
        name: shift.employee.name,
        surname: shift.employee.surname,
        middlename: shift.employee.middlename,
        positionId: shift.employee.positionId,
        email: shift.employee.email
      },
      position: {
        id: shift.position.id,
        name: shift.position.name
      }
    }))

  } catch (error) {
    console.error(error)
    throw error
  }
})