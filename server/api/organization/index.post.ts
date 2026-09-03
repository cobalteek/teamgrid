import { prisma } from '~~/server/utils/prisma'
import {
  defineEventHandler,
  createError,
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const {userId} = await requireUser(event)
  const body = await readBody(event)
  const {name} = body

  if(!name) {
    throw createError({
      statusCode: 400,
      statusMessage: t('validation.organization.requiredFields')
    })
  }
  
  if(!isValidName(name)) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.auth.nameLength')
    })
  }

  if(!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.user.notFound')
    })
  }

  try {
    const newOrganization = await prisma.organization.create({
      data: {
        name,
        members: {
          create: {
            userId,
            roleId: 1
          }
        }
      },
    })

    if(!newOrganization) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.organization.notCreate')
      })
    }

    return newOrganization

  } catch (error) {
    console.error(error)
    throw error
  }
})