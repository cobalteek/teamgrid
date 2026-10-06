import { createError, getRouterParam } from 'h3'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const notificationId = getRouterParam(event, 'id')

  if (!notificationId) {
    throw createError({ statusCode: 400, statusMessage: 'Notification id is required' })
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      OR: [{ isGlobal: true }, { recipients: { some: { userId } } }],
    },
    select: { id: true, consentRequired: true },
  })

  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: 'Notification not found' })
  }

  if (notification.consentRequired) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This notification requires consent and cannot be dismissed as read',
    })
  }

  await prisma.notificationRecipient.upsert({
    where: {
      notificationId_userId: {
        notificationId,
        userId,
      },
    },
    update: { readAt: new Date() },
    create: {
      notificationId,
      userId,
      readAt: new Date(),
    },
  })

  return { ok: true }
})
