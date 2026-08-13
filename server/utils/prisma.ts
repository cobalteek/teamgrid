import {PrismaClient} from '@prisma/client'

const prismaClient = globalThis as unknown as { prisma?: PrismaClient }

const prisma = prismaClient.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  prismaClient.prisma = prisma
}

export {prisma}
