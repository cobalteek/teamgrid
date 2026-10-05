import bcrypt from 'bcryptjs'
import { prisma } from '~~/server/utils/prisma'
import { Prisma } from '@prisma/client'
import { enforceRateLimit } from '~~/server/utils/rate-limit'
import { isValidEmail, isValidName, isValidPassword } from '~~/shared/utils/validation'
import { sendEmail } from '~~/server/utils/mailer'
import { createEmailVerificationCode } from '~~/server/utils/email-verification'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)

  try {
    enforceRateLimit(event, 'register', 5, 60 * 60 * 1000, t('error.auth.tooManyAttempts'))
    const body = await readBody(event)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const gender = typeof body?.gender === 'string' ? body.gender : ''

    if (!email || !password || !name || !gender) {
      throw createError({
        statusCode: 400,
        statusMessage: t('error.form.fieldsEmpty'),
      })
    }

    if (!isValidEmail(email)) {
      throw createError({ statusCode: 400, statusMessage: t('error.auth.invalidEmail') })
    }

    if (!isValidPassword(password)) {
      throw createError({ statusCode: 400, statusMessage: t('error.auth.passwordLength') })
    }

    if (!isValidName(name)) {
      throw createError({ statusCode: 400, statusMessage: t('error.auth.nameLength') })
    }

    if (!['male', 'female'].includes(gender)) {
      throw createError({ statusCode: 400, statusMessage: t('error.auth.selectGender') })
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    })

    if (exists) {
      throw createError({
        statusCode: 409,
        statusMessage: t('error.auth.emailExist'),
      })
    }

    const hash = await bcrypt.hash(password, 10)

    const { code, codeHash, expiresAt } = createEmailVerificationCode()

    const registration = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hash,
          name,
          gender,
        },
      })

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt,
        },
      })

      return { user }
    })

    await sendEmail({
      to: registration.user.email,
      subject: `${t('email.verification.subject')} TeamGrid`,
      text: [
        `${t('email.verification.greeting')}, ${registration.user.name}!`,
        '',
        `${t('email.verification.code')}: ${code}`,
        '',
        t('email.verification.expiration'),
      ].join('\n'),
    })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        statusMessage: t('error.auth.emailExist'),
      })
    }

    throw error
  }
})
