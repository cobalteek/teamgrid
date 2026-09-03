import { prisma } from '~~/server/utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const {userId} = await requireUser(event)
  const t = await useTranslation(event)
  const query = getQuery(event)
  const employeeId = query.employeeId ? String(query.employeeId) : undefined
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  
  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.notFound')
    })
  }

  const isManager = await isManagerOrganization(userId, organizationId)

  if (!isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: t('error.onlyManager')
    })
  }
  if (employeeId && isNaN(Number(employeeId))) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.employeeId.notFound')
    })
  }
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
            email: true,
            color: true
          }
        },

        position: {
          select: {
            id: true,
            name: true,
            color: true
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

    if (!shifts) {
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
        email: shift.employee.email,
        color: shift.employee.color
      },
      position: {
        id: shift.position.id,
        name: shift.position.name,
        color: shift.position.color
      }
    }))

  } catch (error) {
    console.error(error)
    throw error
  }
})