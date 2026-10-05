import jwt from 'jsonwebtoken'
import { createError, getCookie, type H3Event } from 'h3'
import { prisma } from '~~/server/utils/prisma'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'Authentication is not configured' })
  }

  return secret
}

export function signToken(payload: object) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export async function requireAuthenticatedUser(event: H3Event) {
  const token = getCookie(event, 'token')
  const t = await useTranslation(event)
  if (!token) {
    throw createError({ statusCode: 401, message: t('error.auth.unAuth') })
  }

  const secret = getJwtSecret()

  try {
    const payload = jwt.verify(token, secret) as { userId: string }
    const userId = payload.userId
    if (!userId) throw createError({ statusCode: 401, message: t('error.auth.unAuth') })
    return { userId }
  } catch {
    throw createError({ statusCode: 401, message: t('error.auth.unAuth') })
  }
}

export async function requireUser(event: H3Event) {
  const { userId } = await requireAuthenticatedUser(event)
  const t = await useTranslation(event)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerifiedAt: true },
  })

  if (!user) {
    throw createError({ statusCode: 401, message: t('error.auth.unAuth') })
  }

  if (!user.emailVerifiedAt) {
    throw createError({ statusCode: 403, message: t('error.auth.emailNotVerified') })
  }

  return { userId }
}
