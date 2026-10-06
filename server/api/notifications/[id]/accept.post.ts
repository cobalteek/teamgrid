import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '~~/server/utils/prisma'

type AcceptNotificationPayload = {
  checkboxIds?: unknown
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const notificationId = getRouterParam(event, 'id')
  const body = (await readBody<AcceptNotificationPayload>(event)) ?? {}

  if (!notificationId) {
    throw createError({ statusCode: 400, statusMessage: 'Notification id is required' })
  }

  const checkboxIds = body.checkboxIds
  if (
    checkboxIds !== undefined &&
    (!Array.isArray(checkboxIds) || checkboxIds.some((id) => typeof id !== 'string'))
  ) {
    throw createError({ statusCode: 400, statusMessage: 'checkboxIds must be an array of strings' })
  }

  const acceptedCheckboxIds = [...new Set((checkboxIds ?? []) as string[])]
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      OR: [{ isGlobal: true }, { recipients: { some: { userId } } }],
    },
    select: {
      id: true,
      consentRequired: true,
      consentType: true,
      consentVersion: true,
      checkboxes: {
        select: { id: true, required: true },
      },
    },
  })

  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: 'Notification not found' })
  }

  if (!notification.consentRequired || !notification.consentType || !notification.consentVersion) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This notification does not require consent',
    })
  }

  const consentType = notification.consentType
  const consentVersion = notification.consentVersion

  const notificationCheckboxIds = new Set(notification.checkboxes.map((checkbox) => checkbox.id))
  if (acceptedCheckboxIds.some((id) => !notificationCheckboxIds.has(id))) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid notification checkbox' })
  }

  const acceptedCheckboxIdSet = new Set(acceptedCheckboxIds)
  const missingRequiredCheckbox = notification.checkboxes.some(
    (checkbox) => checkbox.required && !acceptedCheckboxIdSet.has(checkbox.id),
  )

  if (missingRequiredCheckbox) {
    throw createError({
      statusCode: 422,
      statusMessage: 'All required consent checkboxes must be accepted',
    })
  }

  const acceptedAt = new Date()
  await prisma.$transaction(async (tx) => {
    await tx.consentRecord.upsert({
      where: {
        userId_consentType_version: {
          userId,
          consentType,
          version: consentVersion,
        },
      },
      update: {
        acceptedAt,
        notificationId,
      },
      create: {
        userId,
        consentType,
        version: consentVersion,
        acceptedAt,
        notificationId,
      },
    })

    await tx.notificationRecipient.upsert({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      update: { readAt: acceptedAt, acceptedAt },
      create: { notificationId, userId, readAt: acceptedAt, acceptedAt },
    })
  })

  return { ok: true, acceptedAt: acceptedAt.toISOString() }
})
