import bcrypt from 'bcryptjs'
import {
  createError,
  defineEventHandler,
  deleteCookie,
  getCookie,
  readBody,
} from 'h3'
import { prisma } from '../../utils/prisma'
import { hashPasswordResetToken } from '~~/server/utils/password-recover'
import { enforceRateLimit } from '~~/server/utils/rate-limit'
import { isValidPassword } from '~~/shared/utils/validation'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  enforceRateLimit(
    event,
    'password-reset',
    10,
    15 * 60 * 1000,
    t('error.auth.tooManyAttempts'),
  )

  const rawToken = getCookie(event, 'password_reset')
  if (!rawToken) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.auth.resetTokenInvalid'),
    })
  }

  const tokenHash = hashPasswordResetToken(rawToken)
  const session = await prisma.passwordResetSession.findUnique({
    where: { tokenHash },
  })
  const now = new Date()

  if (!session || session.usedAt || session.expiresAt <= now) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.auth.resetTokenInvalid'),
    })
  }

  const body = await readBody(event)
  const password = typeof body?.password === 'string' ? body.password : ''
  const confirmPassword =
    typeof body?.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!password || !confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.form.fieldsEmpty'),
    })
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.auth.passwordsNotMatch'),
    })
  }

  if (!isValidPassword(password)) {
    throw createError({
      statusCode: 400,
      statusMessage: t('error.auth.passwordLength'),
    })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const consumedAt = new Date()

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetSession.updateMany({
      where: {
        id: session.id,
        usedAt: null,
        expiresAt: { gt: consumedAt },
      },
      data: { usedAt: consumedAt },
    })

    if (consumed.count !== 1) {
      throw createError({
        statusCode: 401,
        statusMessage: t('error.auth.resetTokenInvalid'),
      })
    }

    await tx.user.update({
      where: { id: session.userId },
      data: {
        password: passwordHash,
        tokenVersion: { increment: 1 },
      },
    })
  })

  deleteCookie(event, 'password_reset', { path: '/' })

  return { success: true }
})
