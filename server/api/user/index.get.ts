import { prisma } from '~~/server/utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'
import { isMemberOrganization } from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
  const {userId} = await requireUser(event)
  const t = await useTranslation(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const roleId = query.roleId ? Number(query.roleId) : undefined
  const queryUserId = query.userId ? String(query.userId) : undefined

  if(!userId) {
    throw createError({
      statusCode: 401,
      message: t('error.user.unauthorized')
    })
  }

  if (!organizationId || isNaN(organizationId)) {
    throw createError({
      statusCode: 400,
      message: t('error.organization.invalidId')
    })
  }

  if(roleId && isNaN(roleId)) {
    throw createError({
      statusCode: 400,
      message: t('error.role.invalidId')
    })
  }

  try {
    const isMember = await isMemberOrganization(userId, organizationId)

    if (!isMember) {
      throw createError({
        statusCode: 403,
        message: t('error.onlyMember')
      })
    }

    const selectFields = {
      id: true,
      email: true,
      name: true,
      gender: true,
      memberships: {
        where: {
          organizationId
        },
        select: {
          organizationId: true
        }
      }
    }

    if (queryUserId) {
      const user = await prisma.user.findFirst({
        where: {
          id: queryUserId,
          memberships: {
            some: {
              organizationId,
              ...(roleId ? { roleId } : {})
            }
          }
        },
        select: selectFields
      })

      if(!user) {
        throw createError({
          statusCode: 404,
          message: t('error.user.notFound')
        })
      }

      return mapUser(user)
    }

    const users = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            organizationId,
            ...(roleId ? { roleId } : {})
          }
        }
      },
      select: selectFields,
      orderBy: {
        name: 'asc'
      }
    })

    return users.map(mapUser)
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
  memberships: Array<{ organizationId: number }>
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    gender: user.gender,
    organizationId: user.memberships.map(membership => membership.organizationId)
  }
}
