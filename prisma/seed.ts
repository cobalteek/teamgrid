import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.role.createMany({
    data: ['user', 'admin', 'owner'].map((name) => ({ name })),
    skipDuplicates: true,
  })
}

main().finally(() => prisma.$disconnect())
