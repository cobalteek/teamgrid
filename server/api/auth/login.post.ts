import bcrypt from 'bcryptjs'
import {prisma} from '~~/server/utils/prisma'
import {signToken} from '~~/server/utils/auth'
import {enforceRateLimit} from '~~/server/utils/rate-limit'
import {isValidEmail, isValidPassword} from '~~/shared/utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const t = await useTranslation(event)

  enforceRateLimit(event, 'login', 10, 15 * 60 * 1000, t('error.auth.tooManyAttempts'))

  if (!email || !password || !isValidEmail(email) || !isValidPassword(password)) {
    throw createError({statusCode: 401, statusMessage: t('error.auth.credentials')})
  }

  const user = await prisma.user.findUnique({where: {email}})
  if (!user) throw createError({statusCode: 401, statusMessage: t('error.auth.credentials')})

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw createError({statusCode: 401, statusMessage: t('error.auth.credentials')})
  const token = signToken({userId: user.id})

  setCookie(event, 'token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // в dev = false
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return {success: true}
})
