import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const body = await readBody(event)
  console.log('Received request body1:', body)
  try {

    console.log('Received request body:', body)
    const { date, employeeId, positionId } = body

    console.log('Received shift data1:', { date, employeeId, positionId })

    if (!date || !employeeId || !positionId) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.shift.requiredFields')
      })
    }

    console.log('Received shift data:', { date, employeeId, positionId })

    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.shift.invalidDate')
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
        positionId
      }
    })

    console.log('Shift created:', shift)

    return shift
  } catch (error) {
        console.error(error)
        
        throw createError({
            statusCode: 500,
            statusMessage: t('error.api.notFound')
        })
  }
})