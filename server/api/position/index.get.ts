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
  const positionId = query.positionId ? Number(query.positionId) : undefined
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
 
  if(!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.get')
    })
  }

  const isManager = await isManagerOrganization(userId, organizationId)

  if(!isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: t('error.onlyManager')
    })
  }

  const selectedFields = {
      id: true,
      name: true,
      fullName: true
  }
  
  try {

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

    throw error
  }
})
