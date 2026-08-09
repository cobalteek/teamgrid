import {PrismaClient} from '@prisma/client'

const prismaClient = globalThis as unknown as { prisma?: PrismaClient }

// The starter uses a regular local PostgreSQL URL. Accelerate requires a
// separate prisma:// URL, so it must not be enabled for this client.
const prisma = prismaClient.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  prismaClient.prisma = prisma
}

export {prisma}
