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