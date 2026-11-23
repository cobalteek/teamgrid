import { prisma } from '~~/server/utils/prisma'
import { requireAuthenticatedUser } from '~~/server/utils/auth'
import { parseUserSettings } from '~~/server/utils/user-settings'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuthenticatedUser(event)
  const body = await readBody<Record<string, unknown>>(event)
  const settings = parseUserSettings(body || {})

  const user = await prisma.user.update({
    where: { id: userId },
    data: settings,
    select: {
      locale: true,
      theme: true,
      timeFormat: true,
      dateFormat: true,
      weekStartsOn: true,
      excludeRussianFiveTwoHolidays: true,
    },
  })

  return user
})
