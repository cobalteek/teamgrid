import { createHmac, randomInt } from 'node:crypto'

export const EMAIL_VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000
export const EMAIL_VERIFICATION_DEADLINE_MS = 72 * 60 * 60 * 1000

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
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_CODE_TTL_MS),
  }
}

export function createEmailVerificationDeadline(now = new Date()) {
  return new Date(now.getTime() + EMAIL_VERIFICATION_DEADLINE_MS)
}

export function hashEmailVerificationCode(code: string) {
  return createHmac('sha256', getSecret()).update(code).digest('hex')
}
