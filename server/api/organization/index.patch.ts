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
  const body = await readBody(event)
  const {name} = body
  if(!isValidName(name)) {
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

  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId
    }
  })

  if (!organization) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.organization.notFound'
    })
  }
    const changeOrganization = await prisma.organization.update({
      where: {
        id: organization.id
      },
      data: {
        name
      }
    })

    return changeOrganization
})