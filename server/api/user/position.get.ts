import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const query = getQuery(event)
  const positionId = query.positionId ? Number(query.positionId) : undefined
  try {
    const selectedFields = {
      id: true,
      name: true
    }

    if(positionId) {
      const position = await prisma.position.findUnique({
        where: {id: positionId},
        select: selectedFields
      })

      if(!position) {
        throw createError({
          statusCode: 404,
          statusMessage: t('error.position.notFound')
        })
      }

      return {
        id: position.id,
        name: position.name
      }
    }

    const positions = await prisma.position.findMany({
      select: selectedFields
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
