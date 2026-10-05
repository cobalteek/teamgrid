import bcrypt from 'bcryptjs'
import { prisma } from '~~/server/utils/prisma'
import { signToken } from '~~/server/utils/auth'
import { enforceRateLimit } from '~~/server/utils/rate-limit'
import { isValidEmail, isValidPassword } from '~~/shared/utils/validation'
import { sendEmail } from '~~/server/utils/mailer'
import {
  createEmailVerificationCode,
  createEmailVerificationDeadline,
} from '~~/server/utils/email-verification'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const t = await useTranslation(event)

  enforceRateLimit(event, 'login', 10, 15 * 60 * 1000, t('error.auth.tooManyAttempts'))

  if (!email || !password || !isValidEmail(email) || !isValidPassword(password)) {
    throw createError({ statusCode: 401, statusMessage: t('error.auth.credentials') })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw createError({ statusCode: 401, statusMessage: t('error.auth.credentials') })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw createError({ statusCode: 401, statusMessage: t('error.auth.credentials') })

  if (!user.emailVerifiedAt) {
    if (!user.emailVerificationDeadline) {
      const { code, codeHash, expiresAt } = createEmailVerificationCode()

      const enrollment = await prisma.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
          where: {
            id: user.id,
            emailVerifiedAt: null,
            emailVerificationDeadline: null,
          },
          data: {
            emailVerificationDeadline: createEmailVerificationDeadline(),
          },
        })

        if (updated.count !== 1) return null

        const token = await tx.emailVerificationToken.create({
          data: {
            userId: user.id,
            codeHash,
            expiresAt,
          },
        })

        return { id: token.id }
      })

      if (enrollment) {
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
            where: { id: enrollment.id, usedAt: null },
            data: { usedAt: new Date() },
          })
          console.error('Failed to send initial email verification code', error)
        }
      }
    }

    throw createError({
      statusCode: 403,
      statusMessage: t('error.auth.emailNotVerified'),
    })
  }

  const token = signToken({ userId: user.id })

  setCookie(event, 'token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'devprod', // в dev = false
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true }
})
