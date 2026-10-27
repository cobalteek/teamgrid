import { prisma } from '~~/server/utils/prisma'
import type { OrganizationAccess } from '~~/types/organization'

export default defineEventHandler(async (event): Promise<OrganizationAccess[]> => {
  const { userId } = await requireUser(event)

  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      organization: {
        name: 'asc',
      },
    },
  })

  return memberships.map(({ organization, role }) => ({
    ...organization,
    role: role.name as OrganizationAccess['role'],
    isOwner: role.name === 'owner',
    isManager: role.name === 'owner' || role.name === 'admin',
  }))
})
