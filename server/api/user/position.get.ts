import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)

  try {
    const positions = await prisma.position.findMany({
      select: {
        id: true,
        name: true,
      }
    })

    if (!positions || positions.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.position.notFound')
      })
    }

    return positions.map((position) => ({
      id: position.id,
      name: position.name
    }))
  } catch (error) {
    console.log(error)

    throw createError({
      statusCode: 404,
      statusMessage: t('error.user.positions')
    })
  }
})
