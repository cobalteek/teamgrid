import { prisma } from '~~/server/utils/prisma'
import { isValidName } from '~~/shared/utils/validation'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const {userId} = await requireUser(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const positionId = query.positionId ? Number(query.positionId) : undefined
  const body = await readBody(event)
  const {name, fullName} = body
  if(!isValidName(name) || !isValidName(fullName)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'error.invalidName'
      })
  }
  if(!organizationId || Number.isNaN(organizationId)) {
    throw createError({
        statusCode: 400,
        statusMessage: 'error.organization.get'
      })
  }
  const isManager = await isManagerOrganization(userId, organizationId)

  if(!isManager) {
    throw createError({
      statusCode: 403,
      statusMessage: 'error.onlyManager'
    })
  }

  const position = await prisma.position.findUnique({
    where: {
      id: positionId
    }
  })

  if (!position) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.position.notFound'
    })
  }
    const changePosition = await prisma.position.update({
      where: {
        id: position.id
      },
      data: {
        name,
        fullName
      }
    })

    return changePosition
})