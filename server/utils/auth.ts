import jwt from 'jsonwebtoken'
import {createError, getCookie, type H3Event} from 'h3'
import { OrganizationMember } from '@prisma/client'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw createError({statusCode: 500, statusMessage: 'Authentication is not configured'})
  }

  return secret
}

export function signToken(payload: object) {
  return jwt.sign(payload, getJwtSecret(), {expiresIn: '7d'})
}


export async function requireUser(event: H3Event) {
  const token = getCookie(event, 'token')
  const t = await useTranslation(event)
  if (!token) {
    throw createError({statusCode: 401, statusMessage: t('error.auth.unAuth')})
  }

  const secret = getJwtSecret()

  try {
    const payload = jwt.verify(token, secret) as {userId: string, organizationId: number}
    const userId = payload.userId
    const organizationId = payload.organizationId
    if (!userId || !organizationId) throw createError({statusCode: 401, statusMessage: t('error.auth.unAuth')})
    return {userId, organizationId}

  } catch {
    throw createError({statusCode: 401, statusMessage: t('error.auth.unAuth')})
  }
}
