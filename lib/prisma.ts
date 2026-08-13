import {PrismaClient} from '@prisma/client'

const prismaClient = globalThis as typeof globalThis & {prisma?: PrismaClient}

const prisma = prismaClient.prisma ?? new PrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  prismaClient.prisma = prisma
}
