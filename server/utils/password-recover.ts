import { createHmac, randomInt } from 'node:crypto'

export const PASSWORD_RECOVER_VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000

function getSecret() {
  const secret = process.env.PASSWORD_RECOVER_VERIFICATION_SECRET

  if (!secret) {
    throw new Error('PASSWORD_RECOVER_VERIFICATION_SECRET is not configured')
  }

  return secret
}

export function createPasswordRecoverCode() {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')

  return {
    code,
    codeHash: hashPasswordRecoverCode(code),
    expiresAt: new Date(Date.now() + PASSWORD_RECOVER_VERIFICATION_CODE_TTL_MS),
  }
}

export function hashPasswordRecoverCode(code: string) {
  return createHmac('sha256', getSecret()).update(code).digest('hex')
}

export function hashPasswordResetToken(token: string) {
  return createHmac('sha256', getSecret()).update(token).digest('hex')
}
