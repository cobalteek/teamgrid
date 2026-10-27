import { prisma } from '~~/server/utils/prisma'
import { defineEventHandler, createError, getQuery } from 'h3'
import { requireOrganizationRole } from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const t = await useTranslation(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const queryUserId = query.userId ? String(query.userId) : undefined

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: t('error.user.unauthorized'),
    })
  }

  if (!organizationId || isNaN(organizationId)) {
    throw createError({
      statusCode: 400,
      message: t('error.organization.invalidId'),
    })
  }

  if (!queryUserId) {
    throw createError({
      statusCode: 400,
      message: t('error.user.notQueryId'),
    })
  }

  try {
    await requireOrganizationRole(
      userId,
      organizationId,
      ['owner', 'admin'],
      t('error.onlyManager'),
    )

    const selectFields = {
      id: true,
      email: true,
      name: true,
      gender: true,
      memberships: {
        where: {
          organizationId,
        },
        select: {
          organizationId: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    }
    const user = await prisma.user.findFirst({
      where: {
        id: queryUserId,
        memberships: {
          some: {
            organizationId,
          },
        },
      },
      select: selectFields,
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: t('error.user.notFound'),
      })
    }

    return mapUser(user)
  } catch (error) {
    console.log(error)

    throw error
  }
})

function mapUser(user: {
  id: string
  email: string
  name: string
  gender: string
  memberships: Array<{ role: { id: number; name: string }; organizationId: number }>
}) {
  const membership = user.memberships[0]

  if (!membership) {
    throw createError({
      statusCode: 404,
      message: 'User membership not found',
    })
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    gender: user.gender,
    organizationId: membership.organizationId,
    role: {
      id: membership.role.id,
      name: membership.role.name,
    },
  }
}
