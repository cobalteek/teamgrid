import { prisma } from '~~/server/utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const query = getQuery(event)
  const positionId = query.positionId ? Number(query.positionId) : undefined
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  try {
    const selectedFields = {
      id: true,
      name: true,
      fullName: true
    }

    if(positionId) {
      const position = await prisma.position.findUnique({
        where: {
          id: positionId,
          organizationId: organizationId
        },
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
        name: position.name,
        fullName: position.fullName
      }
    }

    const positions = await prisma.position.findMany({
      where: {
        organizationId: organizationId
      },
      select: selectedFields
    })

    if (!positions) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.position.notFound')
      })
    }

    return positions.map((position) => ({
      id: position.id,
      name: position.name,
      fullName: position.fullName,
      organizationId: organizationId
    }))
  } catch (error) {
    console.log(error)

    throw createError({
      statusCode: 404,
      statusMessage: t('error.user.positions')
    })
  }
})
