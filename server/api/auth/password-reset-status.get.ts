import { createError, defineEventHandler, getCookie } from 'h3'
import { prisma } from '../../utils/prisma'
import { hashPasswordResetToken } from '~~/server/utils/password-recover'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const rawToken = getCookie(event, 'password_reset')

  if (!rawToken) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.auth.resetTokenInvalid'),
    })
  }

  const session = await prisma.passwordResetSession.findUnique({
    where: { tokenHash: hashPasswordResetToken(rawToken) },
    select: {
      expiresAt: true,
      usedAt: true,
    },
  })

  if (!session || session.usedAt || session.expiresAt <= new Date()) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.auth.resetTokenInvalid'),
    })
  }

  return {
    success: true,
    expiresAt: session.expiresAt.toISOString(),
  }
})
