import { createError, defineEventHandler } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { requireOrganizationRole } from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const body = await readBody(event)
  const t = await useTranslation(event)
  const organizationId = Number(body?.organizationId)
  const employeeIds: string[] = Array.isArray(body?.employeeIds)
    ? body.employeeIds.filter((id: unknown): id is string => typeof id === 'string')
    : []

  if (!Number.isInteger(organizationId) || organizationId <= 0 || employeeIds.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.employee.notFound'),
    })
  }

  if (new Set(employeeIds).size !== employeeIds.length) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.employee.notFound'),
    })
  }

  await requireOrganizationRole(
    userId,
    organizationId,
    ['owner', 'admin'],
    t('error.user.onlyManager'),
  )

  const employees = await prisma.employee.findMany({
    where: { organizationId },
    select: { id: true },
  })

  if (
    employees.length !== employeeIds.length ||
    employees.some((employee) => !employeeIds.includes(employee.id))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.employee.notFound'),
    })
  }

  await prisma.$transaction(
    employeeIds.map((id, sortOrder) =>
      prisma.employee.update({
        where: { id },
        data: { sortOrder },
      }),
    ),
  )

  return { success: true }
})
