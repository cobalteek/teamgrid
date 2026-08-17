import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.position.createMany({
    data: ['admin'].map((name) => ({ name })),
    skipDuplicates: true,
  })
}

main().finally(() => prisma.$disconnect())
