import { prisma } from '~~/server/utils/prisma'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const { userId } = await requireUser(event)
  const body = await readBody(event)
  const { name, description } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: t('validation.organization.requiredFields'),
    })
  }

  if (!isValidName(name)) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.auth.nameLength'),
    })
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.user.notFound'),
    })
  }

  try {
    const ownerRole = await prisma.role.findUnique({
      where: { name: 'owner' },
      select: { id: true },
    })

    if (!ownerRole) {
      throw createError({
        statusCode: 500,
        statusMessage: 'error.role.notFound',
      })
    }

    const newOrganization = await prisma.organization.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId,
            roleId: ownerRole.id,
          },
        },
      },
    })

    if (!newOrganization) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.organization.notCreate'),
      })
    }

    return newOrganization
  } catch (error) {
    console.error(error)
    throw error
  }
})
