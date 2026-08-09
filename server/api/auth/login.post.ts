import bcrypt from 'bcrypt'
import {prisma} from '../../utils/prisma'
import {signToken} from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const t = await useTranslation(event)

  if (!email || !password) {
    throw createError({statusCode: 400, statusMessage: t('error.form.fieldsEmpty')})
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
