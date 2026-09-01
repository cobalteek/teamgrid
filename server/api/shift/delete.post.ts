import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { isOwnerOrganization } from '~~/shared/utils/validation'
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
      statusMessage: 'error.shift.notFound'
    })
  }

  if(!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.organization.notFound'
    })
  }

  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      organization: true
    }
  })

  if (!shift) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Shift not found'
    })
  }

  const ownered = !(await isOwnerOrganization(userId, organizationId))
  if(ownered) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.notOwner'
    })
  }

  await prisma.shift.delete({
    where: { id }
  })

  return {
    success: true
  }
})