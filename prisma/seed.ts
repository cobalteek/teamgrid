import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';
  `
  const tables = tablenames
  .map(({ tablename }) => `"${tablename}"`)
  .join(', ')

  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`)
  }

  await prisma.role.createMany({
    data: ['owner','admin','user'].map((name) => ({ name })),
    skipDuplicates: true,
  })
}

main().finally(() => prisma.$disconnect())
