import { createError, getRequestIP, type H3Event } from 'h3'

type RateLimitEntry = { count: number; resetAt: number }

const attempts = new Map<string, RateLimitEntry>()
let lastCleanupAt = 0

export function enforceRateLimit(
  event: H3Event,
  scope: string,
  limit: number,
  windowMs: number,
  statusMessage: string,
  identifier = '',
) {
  const now = Date.now()
  if (now - lastCleanupAt >= 60_000) {
    for (const [key, entry] of attempts) {
      if (entry.resetAt <= now) attempts.delete(key)
    }
    lastCleanupAt = now
  }

  const ip =
    getRequestIP(event, {
      xForwardedFor: process.env.TRUST_PROXY === '1',
    }) ?? 'unknown'
  const normalizedIdentifier = identifier.trim().toLowerCase()
  const key = `${scope}:${ip}:${normalizedIdentifier}`
  const entry = attempts.get(key)

  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (entry.count >= limit) {
    throw createError({ statusCode: 429, statusMessage })
  }

  entry.count += 1
}
