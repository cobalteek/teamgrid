import { prisma } from '../../utils/prisma'
import { isValidName } from '../../../shared/utils/validation'
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
  const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      },
      include: {
        role: true
      }
  })
  if(!member) {
    throw createError({
        statusCode: 404,
        statusMessage: 'error.role.notFound'
      })
  }
  const canChangePosition= ['owner', 'admin'].includes(member?.role.name)
  if(!canChangePosition) {
    throw createError({
        statusCode: 403,
        statusMessage: 'error.permissionDenied'
      })
  }
    const changePosition = await prisma.position.update({
      where: {
        id: positionId
      },
      data: {
        name,
        fullName
      }
    })

    return changePosition
})