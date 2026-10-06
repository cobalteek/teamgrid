import { createError } from 'h3'
import { prisma } from '~~/server/utils/prisma'

export function getNotificationAdminEmails() {
  return (process.env.NOTIFICATION_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireNotificationAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  if (!user || !getNotificationAdminEmails().includes(user.email.toLowerCase())) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only configured notification administrators can send notifications',
    })
  }

  return user
}

export function validateNotificationActionUrl(actionUrl: unknown) {
  if (actionUrl === undefined || actionUrl === null || actionUrl === '') return null

  if (typeof actionUrl !== 'string' || !actionUrl.startsWith('/') || actionUrl.startsWith('//')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'actionUrl must be a relative application URL',
    })
  }

  return actionUrl
}
