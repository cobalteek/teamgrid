import { prisma } from '~~/server/utils/prisma'
import { isValidName } from '~~/shared/utils/validation'
import { defineEventHandler, createError, getQuery } from 'h3'
import { requireOrganizationRole } from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const { userId } = await requireUser(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const body = await readBody(event)
  const { name, fullName } = body
  if (!isValidName(name) || !isValidName(fullName)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.invalidName',
    })
  }
  if (!organizationId || Number.isNaN(organizationId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'error.organization.get',
    })
  }
  await requireOrganizationRole(userId, organizationId, ['owner', 'admin'], 'error.onlyManager')

  const positionsCount = await prisma.position.count({
    where: {
      organizationId,
    },
  })

  const colorIndexPosition = Math.min(positionsCount, POSITION_COLORS.length - 1)

  const colorPosition = POSITION_COLORS[colorIndexPosition]

  if (!colorPosition) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.color.notFound'),
    })
  }

  const createPosition = await prisma.position.create({
    data: {
      name,
      fullName,
      organizationId,
      color: colorPosition,
    },
  })

  return createPosition
})
