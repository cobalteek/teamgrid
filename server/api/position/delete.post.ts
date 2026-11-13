import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const body = await readBody(event)
  const id = body.id ? Number(body.id) : undefined
  const withShifts = body.withShifts === true
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.employeeId.notReceived',
    })
  }

  if (withShifts !== true && withShifts !== false) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.withShifts.notReceived',
    })
  }

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.organization.notFound',
    })
  }

  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], 'error.onlyManager')

  const position = await prisma.position.findUnique({
    where: { id, organizationId },
    include: {
      organization: true,
    },
  })

  if (!position) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.position.notFound',
    })
  }

  const shifts = await prisma.shift.findMany({
    where: { positionId: id, organizationId },
  })

  if (shifts.length > 0) {
    shifts.forEach(async (shift) => {
      if (withShifts) {
        await prisma.shift.delete({
          where: { id: shift.id },
        })
      } else {
        await prisma.shift.update({
          where: { id: shift.id },
          data: { positionId: null },
        })
      }
    })
  }

  await prisma.position.delete({
    where: { id },
  })

  return {
    success: true,
  }
})
