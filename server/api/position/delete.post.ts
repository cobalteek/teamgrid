import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { isManagerOrganization } from '~~/server/utils/member'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const { id } = await readBody(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.employeeId.notReceived'
    })
  }

  if(!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.organization.notFound'
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
    where: { id },
    include: {
      organization: true
    }
  })

  if (!position) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.position.notFound'
    })
  }

  const shifts = await prisma.shift.findMany({
    where: {positionId: id}
  })

  if(!shifts) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.shift.infoNotReceived'
    })
  }

  if(shifts.length > 0) {
    await prisma.shift.deleteMany({
      where: {
        positionId: id
      }
    })
  }

  await prisma.position.delete({
    where: { id }
  })

  return {
    success: true
  }
})