import { getQuery } from 'h3'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const query = getQuery(event)
  const unreadOnly = query.unread !== 'false'

  const [notifications, user] = await Promise.all([
    prisma.notification.findMany({
      where: unreadOnly
        ? {
            OR: [
              {
                isGlobal: true,
                recipients: { none: { userId } },
              },
              {
                recipients: {
                  some: { userId, readAt: null },
                },
              },
            ],
          }
        : {
            OR: [{ isGlobal: true }, { recipients: { some: { userId } } }],
          },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        message: true,
        actionUrl: true,
        consentRequired: true,
        consentType: true,
        consentVersion: true,
        createdAt: true,
        checkboxes: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, label: true, required: true, sortOrder: true },
        },
      },
    }),
    unreadOnly
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { consents: { select: { consentType: true, version: true } } },
        })
      : Promise.resolve(null),
  ])

  const acceptedConsentKeys = new Set(
    (user?.consents ?? []).map((consent) => `${consent.consentType}:${consent.version}`),
  )

  return notifications
    .filter(
      (notification) =>
        !unreadOnly ||
        !notification.consentRequired ||
        !notification.consentType ||
        !notification.consentVersion ||
        !acceptedConsentKeys.has(`${notification.consentType}:${notification.consentVersion}`),
    )
    .map((notification) => ({
      ...notification,
      checkboxes: notification.checkboxes.map((checkbox) => ({ ...checkbox, checked: false })),
      createdAt: notification.createdAt.toISOString(),
    }))
})
