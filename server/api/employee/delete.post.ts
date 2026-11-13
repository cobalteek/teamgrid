import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'
import { defineEventHandler, createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const body = await readBody(event)
  const id = body.id ? String(body.id) : undefined
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

  const employee = await prisma.employee.findUnique({
    where: { id, organizationId },
    include: {
      organization: true,
    },
  })

  if (!employee) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.employee.notFound',
    })
  }

  const shifts = await prisma.shift.findMany({
    where: { employeeId: id, organizationId },
  })

  if (!shifts) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.shift.infoNotReceived',
    })
  }

  if (shifts.length > 0) {
    if (withShifts) {
      shifts.forEach(async (shift) => {
        await prisma.shift.delete({
          where: { id: shift.id },
        })
      })
    } else {
      shifts.forEach(async (shift) => {
        await prisma.shift.update({
          where: { id: shift.id },
          data: { employeeId: null },
        })
      })
    }
  }

  await prisma.employee.delete({
    where: { id },
  })

  return {
    success: true,
  }
})
