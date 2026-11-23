import { prisma } from '~~/server/utils/prisma'
import { requireAuthenticatedUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuthenticatedUser(event)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      locale: true,
      theme: true,
      timeFormat: true,
      dateFormat: true,
      weekStartsOn: true,
      excludeRussianFiveTwoHolidays: true,
    },
  })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'error.auth.unAuth' })
  }

  return user
})
