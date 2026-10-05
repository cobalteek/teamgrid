import { prisma } from '~~/server/utils/prisma'
import { enforceRateLimit } from '~~/server/utils/rate-limit'
import { isValidEmail } from '~~/shared/utils/validation'
import { createEmailVerificationCode } from '~~/server/utils/email-verification'
import { sendEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  enforceRateLimit(event, 'resend-verification', 5, 60 * 60 * 1000, t('error.auth.tooManyAttempts'))

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  // Always return the same response so this endpoint cannot be used to enumerate accounts.
  if (!isValidEmail(email)) {
    return { success: true }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerifiedAt: true,
      emailVerificationDeadline: true,
    },
  })

  const now = new Date()
  if (
    !user ||
    user.emailVerifiedAt ||
    !user.emailVerificationDeadline ||
    user.emailVerificationDeadline <= now
  ) {
    return { success: true }
  }

  const { code, codeHash, expiresAt } = createEmailVerificationCode()

  const token = await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt,
    },
  })

  try {
    await sendEmail({
      to: user.email,
      subject: `${t('email.verification.subject')} TeamGrid`,
      text: [
        `${t('email.verification.greeting')}, ${user.name}!`,
        '',
        `${t('email.verification.code')}: ${code}`,
        '',
        t('email.verification.expiration'),
      ].join('\n'),
    })
  } catch (error) {
    await prisma.emailVerificationToken.updateMany({
      data: {
        usedAt: now,
      },
      where: { id: token.id, usedAt: null },
    })
    console.error('Failed to resend email verification code', error)
    return { success: true }
  }

  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null, id: { not: token.id } },
    data: { usedAt: now },
  })

  return { success: true }
})
