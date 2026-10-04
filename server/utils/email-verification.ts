import { createHash, randomBytes } from 'node:crypto'

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

export function createEmailVerificationToken() {
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashEmailVerificationToken(rawToken)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

  return { rawToken, tokenHash, expiresAt }
}

export function hashEmailVerificationToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex')
}

export function buildEmailVerificationUrl(rawToken: string) {
  const origin = process.env.APP_ORIGIN

  if (!origin) {
    throw new Error('APP_ORIGIN is not configured')
  }

  const baseUrl = origin.endsWith('/') ? origin : `${origin}/`
  const url = new URL('verify-email', baseUrl)

  url.searchParams.set('token', rawToken)

  return url.toString()
}