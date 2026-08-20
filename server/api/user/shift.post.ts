import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const body = await readBody(event)
  try {
    const { date, employeeId, positionId, organizationId } = body

    if (!date || !employeeId || !positionId) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.shift.requiredFields')
      })
    }
    if(!organizationId) {
      throw createError({
        statusCode: 400,
        statusMessage: t('error.organization.get')
      })
    }
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.employee.notFound')
      })
    }

    const position = await prisma.position.findUnique({
      where: { id: positionId }
    })

    if (!position) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.position.notFound')
      })
    }

    const shift = await prisma.shift.create({
      data: {
        date,
        employeeId,
        positionId,
        organizationId
      },
      include: {
        employee: true,
        position: true,
        organization: true
      }
    })

    return shift
  } catch (error) {
        console.error(error)
        
        throw createError({
            statusCode: 500,
            statusMessage: t('error.api.notFound')
        })
  }
})