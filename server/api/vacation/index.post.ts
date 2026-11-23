import { createError, defineEventHandler } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { requireOrganizationRole } from '~~/server/utils/member'

function parseDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const date = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const body = await readBody(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const employeeId = typeof body?.employeeId === 'string' ? body.employeeId : ''
  const startDate = parseDate(body?.startDate)
  const endDate = parseDate(body?.endDate)
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 500) : null

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.notFound'),
    })
  }

  if (!employeeId || !startDate || !endDate || startDate > endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.vacation.invalidDates'),
    })
  }

  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], t('error.onlyManager'))

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, organizationId },
    select: { id: true },
  })

  if (!employee) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.employee.notFound'),
    })
  }

  return prisma.vacation.create({
    data: {
      employeeId,
      organizationId,
      startDate,
      endDate,
      note: note || null,
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      note: true,
      employeeId: true,
      employee: {
        select: {
          id: true,
          name: true,
          surname: true,
          middlename: true,
        },
      },
    },
  })
})
