import { createError } from 'h3'
import type { OrganizationRole } from '~~/types/organization'
import { prisma } from './prisma'

export async function getOrganizationMembership(userId: string, organizationId: number) {
  return prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    include: {
      role: true,
    },
  })
}

export async function requireOrganizationRole(
  userId: string,
  organizationId: number,
  allowedRoles: readonly OrganizationRole[],
  statusMessage = 'error.onlyMember',
) {
  const membership = await getOrganizationMembership(userId, organizationId)
  const role = membership?.role.name as OrganizationRole | undefined

  if (!membership || !role || !allowedRoles.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage,
    })
  }

  return membership
}
