import {createError, getRequestIP, type H3Event} from 'h3'

type RateLimitEntry = {count: number; resetAt: number}

const attempts = new Map<string, RateLimitEntry>()

export function enforceRateLimit(
  event: H3Event,
  scope: string,
  limit: number,
  windowMs: number,
  statusMessage: string,
) {
  const now = Date.now()
  const ip = getRequestIP(event, {xForwardedFor: true}) ?? 'unknown'
  const key = `${scope}:${ip}`
  const entry = attempts.get(key)

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, {count: 1, resetAt: now + windowMs})
    return
  }

  if (entry.count >= limit) {
    throw createError({statusCode: 429, statusMessage})
  }

  entry.count += 1
}
