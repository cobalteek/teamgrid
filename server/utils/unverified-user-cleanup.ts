import { prisma } from '~~/server/utils/prisma'

export async function deleteExpiredUnverifiedUsers(now = new Date()) {
  return prisma.user.deleteMany({
    where: {
      emailVerifiedAt: null,
      emailVerificationDeadline: { lt: now },
    },
  })
}
