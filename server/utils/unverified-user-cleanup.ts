import { prisma } from '~~/server/utils/prisma'

export const UNVERIFIED_USER_TTL_MS = 72 * 60 * 60 * 1000

export async function deleteExpiredUnverifiedUsers(now = new Date()) {
  const createdBefore = new Date(now.getTime() - UNVERIFIED_USER_TTL_MS)

  return prisma.user.deleteMany({
    where: {
      emailVerifiedAt: null,
      createdAt: { lt: createdBefore },
    },
  })
}
