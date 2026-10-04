import { prisma } from '~~/server/utils/prisma'
import { hashEmailVerificationToken } from '~~/server/utils/email-verification'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired verification link',
    })
  }

  const tokenHash = hashEmailVerificationToken(token)
  const now = new Date()

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  if (!record || record.usedAt || record.expiresAt <= now) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired verification link',
    })
  }

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.emailVerificationToken.updateMany({
      where: {
        id: record.id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })

    if (consumed.count !== 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification link',
      })
    }

    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: now },
    })
  })

  return { success: true }
})