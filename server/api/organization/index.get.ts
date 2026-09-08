import { prisma } from '~~/server/utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const {userId} = await requireUser(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  try {

    if(organizationId) {
      const owneredOrganization = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId
          }
        },
        include: {
          role: true
        }
      })

      if(!owneredOrganization) {
        throw createError({
          statusCode: 404,
          statusMessage: 'error.organization.notFound.notOwner'
        })
      }
      
      return owneredOrganization?.role.name === 'owner'
    }

    const memberOrganizations = await prisma.organizationMember.findMany({
      where: {
        userId
      },
      select: {
        organization: true
      }
    })

    if(!memberOrganizations) {
      throw createError({
        statusCode: 404,
        statusMessage: t('error.organization.notFound')
      })
    }

    return memberOrganizations.map(({organization}) => organization)

  } catch (error) {
    console.error(error)
    throw error
  }
})