import { createError, defineEventHandler, readBody } from 'h3'
import { randomBytes } from 'node:crypto'
import { prisma } from '../../utils/prisma'
import { hashPasswordRecoverCode, hashPasswordResetToken } from '~~/server/utils/password-recover'
import { enforceRateLimit } from '~~/server/utils/rate-limit'

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  const invalidCode = () =>
    createError({
      statusCode: 400,
      statusMessage: t('error.auth.emailVerificationInvalid'),
    })

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''

  enforceRateLimit(
    event,
    'password-recovery-verify-ip',
    20,
    15 * 60 * 1000,
    t('error.auth.tooManyAttempts'),
  )

  if (isValidEmail(email)) {
    enforceRateLimit(
      event,
      'password-recovery-verify-email',
      10,
      15 * 60 * 1000,
      t('error.auth.tooManyAttempts'),
      email,
    )
  }

  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    throw invalidCode()
  }

  const now = new Date()
  const record = await prisma.passwordRecoverToken.findFirst({
    where: {
      user: { email },
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      codeHash: true,
      attempts: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  if (
    !record ||
    record.usedAt ||
    record.expiresAt <= now ||
    record.attempts >= 5 ||
    record.codeHash !== hashPasswordRecoverCode(code)
  ) {
    if (record && !record.usedAt && record.attempts < 5) {
      await prisma.passwordRecoverToken.updateMany({
        where: {
          id: record.id,
          usedAt: null,
          attempts: { lt: 5 },
        },
        data: { attempts: { increment: 1 } },
      })
    }

    throw invalidCode()
  }

  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashPasswordResetToken(rawToken)
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordRecoverToken.updateMany({
      where: {
        id: record.id,
        usedAt: null,
        attempts: { lt: 5 },
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })

    if (consumed.count !== 1) {
      throw invalidCode()
    }

    await tx.passwordRecoverToken.updateMany({
      where: {
        userId: record.userId,
        usedAt: null,
      },
      data: { usedAt: now },
    })

    await tx.passwordResetSession.updateMany({
      where: {
        userId: record.userId,
        usedAt: null,
      },
      data: { usedAt: now },
    })

    await tx.passwordResetSession.create({
      data: {
        userId: record.userId,
        tokenHash,
        expiresAt,
      },
    })
  })

  setCookie(event, 'password_reset', rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'devprod',
    maxAge: PASSWORD_RESET_TTL_MS / 1000,
    path: '/',
  })

  return {
    success: true,
    expiresAt: expiresAt.toISOString(),
  }
})
