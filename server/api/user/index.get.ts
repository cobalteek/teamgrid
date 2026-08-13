import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError,
  getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const query = getQuery(event)
  const position = query.position ? String(query.position) : undefined

  try {
    const users = await prisma.user.findMany({
      ...(position && {
        where: {
          positions: {
            some: {
              position: {
                name: position
              }
            }
          }
        }
      }),
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        positions: {
          include: {
            position: true
          }
        }
      }
    })

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      positions: user.positions.map((userPosition) => userPosition.position.name)
    }))
  } catch (error) {
    console.log(error)

    throw createError({
      statusCode: 404,
      statusMessage: t('error.user.get')
    })
  }
})
