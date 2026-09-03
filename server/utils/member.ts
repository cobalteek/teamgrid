export async function isManagerOrganization(userId: string, organizationId: number) {
  const member = await prisma.organizationMember.findUnique({
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

  return member?.role.name === 'owner' || member?.role.name === 'admin'
}