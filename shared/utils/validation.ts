import { prisma } from '~~/server/utils/prisma'
export function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidPassword(value: string) {
  return value.length >= 8 && value.length <= 128
}

export function isValidName(value: string) {
  return value.length >= 2 && value.length <= 80
}

export function isValidPosition(value: string) {
  return value.length >= 2 && value.length <= 128
}

export async function isOwnerOrganization(userId: string, organizationId: number) {
  const owneredOrganization = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
      userId,
      organizationId
    }
    },
    include: {
      role: true
    }
  })

  return owneredOrganization?.role.name === 'owner'
}