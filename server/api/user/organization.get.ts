import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const {userId} = await requireUser(event)
  try {
    const owneredOrganizations = await prisma.organizationMember.findMany({
      where: {
        userId,
        role: {
          name: 'owner'
        }
      },
      select: {
        organization: true
      }
    })

    if(!owneredOrganizations || owneredOrganizations.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.organization.notFound')
      })
    }

    return owneredOrganizations.map(({organization}) => organization)

  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 404,
      statusMessage: t('error.api.notFound')
    })
  }
})