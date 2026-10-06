import { createError, readBody } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import {
  requireNotificationAdmin,
  validateNotificationActionUrl,
} from '~~/server/utils/notifications'

type NotificationPayload = {
  title?: unknown
  message?: unknown
  actionUrl?: unknown
  all?: unknown
  allMissingConsent?: unknown
  userIds?: unknown
  emails?: unknown
  consentRequired?: unknown
  consentType?: unknown
  consentVersion?: unknown
  checkboxes?: unknown
}

type NotificationCheckboxInput = {
  label: string
  required: boolean
  sortOrder: number
}

function parseStringList(value: unknown, fieldName: string) {
  if (value === undefined) return []

  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== 'string' || item.trim().length === 0)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: `${fieldName} must be an array of strings`,
    })
  }

  return [...new Set(value.map((item) => item.trim()))]
}

function parseCheckboxes(value: unknown): NotificationCheckboxInput[] {
  if (value === undefined) return []

  if (!Array.isArray(value) || value.length > 20) {
    throw createError({
      statusCode: 400,
      statusMessage: 'checkboxes must be an array with at most 20 items',
    })
  }

  return value.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid notification checkbox' })
    }

    const label = 'label' in item && typeof item.label === 'string' ? item.label.trim() : ''
    const required = !('required' in item) || item.required === true

    if (!label || label.length > 1000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Each checkbox label is required and must be 1000 characters or less',
      })
    }

    if ('required' in item && typeof item.required !== 'boolean') {
      throw createError({ statusCode: 400, statusMessage: 'Checkbox required must be boolean' })
    }

    return { label, required, sortOrder: index }
  })
}

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  await requireNotificationAdmin(userId)
  const body = (await readBody<NotificationPayload>(event)) ?? {}

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const actionUrl = validateNotificationActionUrl(body.actionUrl)
  const all = body.all === true
  const allMissingConsent = body.allMissingConsent === true
  const userIds = parseStringList(body.userIds, 'userIds')
  const emails = parseStringList(body.emails, 'emails').map((email) => email.toLowerCase())
  const consentRequired = body.consentRequired === true
  const consentType = typeof body.consentType === 'string' ? body.consentType.trim() : ''
  const consentVersion = typeof body.consentVersion === 'string' ? body.consentVersion.trim() : ''
  const checkboxes = parseCheckboxes(body.checkboxes)
  if (!title || title.length > 160) {
    throw createError({
      statusCode: 400,
      statusMessage: 'title is required and must be 160 characters or less',
    })
  }

  if (!message || message.length > 5000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'message is required and must be 5000 characters or less',
    })
  }

  if (consentRequired && (!consentType || !consentVersion || checkboxes.length === 0)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Consent notifications require consentType, consentVersion, and checkboxes',
    })
  }

  if (all && allMissingConsent) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Use either all or allMissingConsent, not both',
    })
  }

  if (all && consentRequired) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Use allMissingConsent for consent notifications',
    })
  }

  if (allMissingConsent && !consentRequired) {
    throw createError({
      statusCode: 400,
      statusMessage: 'allMissingConsent requires a consent notification',
    })
  }

  if (!consentRequired && (consentType || consentVersion || checkboxes.length > 0)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'consent fields and checkboxes require consentRequired: true',
    })
  }

  if (consentType.length > 100 || consentVersion.length > 160) {
    throw createError({
      statusCode: 400,
      statusMessage: 'consentType or consentVersion is too long',
    })
  }

  if ((all || allMissingConsent) && (userIds.length > 0 || emails.length > 0)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Use either all or selected recipients, not both',
    })
  }

  if (!all && !allMissingConsent && userIds.length === 0 && emails.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Specify all: true, userIds, or emails' })
  }

  const users = all
    ? []
    : await prisma.user.findMany({
        where: {
          ...(allMissingConsent
            ? {
                consents: {
                  none: { consentType, version: consentVersion },
                },
              }
            : {
                OR: [
                  ...(userIds.length > 0 ? [{ id: { in: userIds } }] : []),
                  ...(emails.length > 0 ? [{ email: { in: emails } }] : []),
                ],
              }),
        },
        select: { id: true, email: true },
      })

  const foundUserIds = new Set(users.map((user) => user.id))
  const foundEmails = new Set(users.map((user) => user.email.toLowerCase()))
  const hasMissingUserId = userIds.some((id) => !foundUserIds.has(id))
  const hasMissingEmail = emails.some((email) => !foundEmails.has(email))

  if (!all && !allMissingConsent && (hasMissingUserId || hasMissingEmail)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'One or more notification recipients were not found',
    })
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      actionUrl,
      isGlobal: all,
      consentRequired,
      consentType: consentType || null,
      consentVersion: consentVersion || null,
      createdById: userId,
      checkboxes: checkboxes.length > 0 ? { create: checkboxes } : undefined,
      ...(all
        ? {}
        : {
            recipients: {
              create: users.map((user) => ({ userId: user.id })),
            },
          }),
    },
    select: {
      id: true,
      title: true,
      message: true,
      actionUrl: true,
      isGlobal: true,
      consentRequired: true,
      consentType: true,
      consentVersion: true,
      createdAt: true,
      checkboxes: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, label: true, required: true, sortOrder: true },
      },
    },
  })

  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
    recipientCount: all ? 'all' : users.length,
  }
})
