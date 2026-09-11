import { prisma } from '~~/server/utils/prisma'
import {isMemberOrganization} from '~~/server/utils/member'
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
  const startDate = query.startDate ? new Date(`${String(query.startDate)}T00:00:00Z`) : undefined
  const endDate = query.endDate ? new Date(`${String(query.endDate)}T00:00:00Z`) : undefined
  
  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.notFound')
    })
  }

  if ((startDate && Number.isNaN(startDate.getTime())) || (endDate && Number.isNaN(endDate.getTime()))) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.shift.notFound')
    })
  }

  if ((startDate && !endDate) || (!startDate && endDate) || (startDate && endDate && startDate >= endDate)) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.shift.notFound')
    })
  }

  const isMember = await isMemberOrganization(userId, organizationId)

  if (!isMember) {
    throw createError({
      statusCode: 403,
      statusMessage: t('error.onlyManager')
    })
  }
  
  try {
    const where = {
      organizationId,
      ...(employeeId && { employeeId }),
      ...((startDate || endDate) && {
        date: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lt: endDate })
        }
      })
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
