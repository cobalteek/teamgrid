import { prisma } from '../../utils/prisma'

import {
  defineEventHandler,
  createError,
  readBody
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)

  const body = await readBody(event)

  const { shifts, organizationId } = body

  if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.bulk.notFound')
    })
  }

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.organization.get')
    })
  }

  try {
    await prisma.shift.createMany({
      data: shifts.map(shift => ({
        ...shift,
        organizationId
      }))
    })
  } catch (error) {
    console.error(error)

    throw createError({
      statusCode: 500,
      statusMessage: t('error.bulk.notFound')
    })
  }
})