import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const query = getQuery(event)
  const organizationId = query.organizationId ? Number(query.organizationId) : undefined
  const roleId = query.roleId ? Number(query.roleId) : undefined
  const userId = query.userId ? String(query.userId) : undefined
  try {
    const selectFields = {
      id: true,
        email: true,
        name: true,
        gender: true,
        memberships: {
          include: {
            organization: true
          }
        }
    }

    if(userId) {
      const user = await prisma.user.findUnique({
        where: {id: userId},
        select: selectFields
      })

      if(!user) {
        throw createError({
          statusCode: 404,
          statusMessage: t('error.user.notFound')
        })
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        organizationId: user.memberships.map((memberships) => memberships.organization.id)
      }
    }

    const users = await prisma.user.findMany({
      ...(organizationId && {
        where: {
          memberships: {
            some: {
              organizationId: organizationId,
              role: {
                id: roleId
              }
            }
          }
        }
      }),
      select: selectFields
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      organizationId: user.memberships.map((memberships) => memberships.organization.id)
    }))
  } catch (error) {
    console.log(error)

    throw error
  }
})
