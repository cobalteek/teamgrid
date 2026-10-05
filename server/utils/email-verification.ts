import { createHmac, randomInt } from 'node:crypto'

const CODE_TTL_MS = 10 * 60 * 1000

function getSecret() {
  const secret = process.env.EMAIL_VERIFICATION_SECRET

  if (!secret) {
    throw new Error('EMAIL_VERIFICATION_SECRET is not configured')
  }

  return secret
}

export function createEmailVerificationCode() {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')

  return {
    code,
    codeHash: hashEmailVerificationCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  }
}

export function hashEmailVerificationCode(code: string) {
  return createHmac('sha256', getSecret()).update(code).digest('hex')
}
