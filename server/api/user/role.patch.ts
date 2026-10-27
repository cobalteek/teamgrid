import { prisma } from '../../utils/prisma'
import { defineEventHandler, createError } from 'h3'
import { requireOrganizationRole } from '~~/server/utils/member.ts'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const { userId } = await requireUser(event)
  const body = await readBody(event)
  const query = getQuery(event)
  const bodyUserId = body.userId ? String(body.userId) : ''
  const roleName = body.role ? String(body.role) : ''
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined

  if (!roleName) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.role.invalidId'),
    })
  }

  if (roleName !== 'user' && roleName !== 'admin') {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.role.invalidId'),
    })
  }

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.notReceived'),
    })
  }

  await requireOrganizationRole(userId, organizationId, ['owner'], t('error.onlyOwner'))

  const role = await prisma.role.findUnique({
    where: {
      name: roleName,
    },
  })

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.role.notFound'),
    })
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: bodyUserId,
        organizationId,
      },
    },
    include: {
      role: true,
    },
  })

  if (!membership) {
    throw createError({
      statusCode: 404,
      statusMessage: t('error.user.notFound'),
    })
  }

  if (membership.role.name === 'owner') {
    throw createError({
      statusCode: 403,
      statusMessage: t('error.user.creatorForever'),
    })
  }

  try {
    const changedRole = await prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: bodyUserId,
          organizationId,
        },
      },
      data: {
        roleId: role.id,
      },
    })

    return changedRole
  } catch (error) {
    console.error(error)
    throw error as string
  }
})
