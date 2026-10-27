import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~~/server/utils/prisma'
import { sendEmail } from '~~/server/utils/mailer'
import { enforceRateLimit } from '~~/server/utils/rate-limit'
import { createPasswordRecoverCode } from '~~/server/utils/password-recover'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  enforceRateLimit(
    event,
    'password-recovery-ip',
    10,
    60 * 60 * 1000,
    t('error.auth.tooManyAttempts'),
  )

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!isValidEmail(email)) {
    return { success: true }
  }

  enforceRateLimit(
    event,
    'password-recovery-email',
    5,
    60 * 60 * 1000,
    t('error.auth.tooManyAttempts'),
    email,
  )

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerifiedAt: true,
    },
  })

  if (!user?.emailVerifiedAt || !user.email) {
    return { success: true }
  }

  const { code, codeHash, expiresAt } = createPasswordRecoverCode()
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.passwordRecoverToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: now },
    })

    await tx.passwordResetSession.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: now },
    })

    await tx.passwordRecoverToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    })
  })

  try {
    await sendEmail({
      to: user.email,
      subject: `${t('message.recoverPasswordTitle')} TeamGrid`,
      text: [
        `${t('email.verification.greeting')}, ${user.name}!`,
        '',
        `${t('message.recoverPassword')}: ${code}`,
        '',
        t('message.recoverPasswordWarn'),
      ].join('\n'),
    })
  } catch (error) {
    await prisma.passwordRecoverToken.updateMany({
      where: {
        userId: user.id,
        codeHash,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    })
    console.error('Failed to send password recovery email', error)
  }

  return { success: true }
})
