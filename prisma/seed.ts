import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

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

  const password = await bcrypt.hash('Password', 10)

  const organization = await prisma.organization.create({
    data: {
      name: 'Admin_organization'
    }
  })

  const ownerRole = await prisma.role.create({
    data: {
      name: 'owner'
    }
  })

  await prisma.role.createMany({
    data: [
      { name: 'admin' },
      { name: 'user' }
    ],
    skipDuplicates: true,
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password,
      gender: 'male',
    }
  })

  await prisma.organizationMember.create({
    data: {
      userId: admin.id,
      organizationId: organization.id,
      roleId: ownerRole.id,
    }
  })
}

main().finally(() => prisma.$disconnect())
