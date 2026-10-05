import { prisma } from '~~/server/utils/prisma'
import { enforceRateLimit } from '~~/server/utils/rate-limit'
import { isValidEmail } from '~~/shared/utils/validation'
import { hashEmailVerificationCode } from '~~/server/utils/email-verification'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)
  enforceRateLimit(event, 'verify-email', 10, 15 * 60 * 1000, t('error.auth.tooManyAttempts'))

  const body = await readBody(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''

  const invalidCode = () =>
    createError({
      statusCode: 400,
      statusMessage: t('error.auth.emailVerificationInvalid'),
    })

  if (!isValidEmail(email) || !/^\d{6}$/.test(code)) {
    throw invalidCode()
  }

  const now = new Date()
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      user: { email },
      usedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          email: true,
          name: true,
          emailVerifiedAt: true,
          emailVerificationDeadline: true,
        },
      },
      codeHash: true,
      attempts: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  if (
    !record ||
    record.usedAt ||
    record.user.emailVerifiedAt ||
    !record.user.emailVerificationDeadline ||
    record.user.emailVerificationDeadline <= now ||
    record.expiresAt <= now ||
    record.attempts >= 5 ||
    record.codeHash !== hashEmailVerificationCode(code)
  ) {
    if (record && !record.usedAt && record.attempts < 5) {
      await prisma.emailVerificationToken.updateMany({
        where: {
          id: record.id,
          usedAt: null,
          attempts: { lt: 5 },
        },
        data: { attempts: { increment: 1 } },
      })
    }

    throw invalidCode()
  }

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.emailVerificationToken.updateMany({
      where: {
        id: record.id,
        usedAt: null,
        attempts: { lt: 5 },
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })

    if (consumed.count !== 1) {
      throw invalidCode()
    }

    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: now, emailVerificationDeadline: null },
    })

    const employeeOrganizations = await tx.employee.findMany({
      where: {
        email: {
          equals: record.user.email,
          mode: 'insensitive',
        },
      },
      select: { organizationId: true },
    })

    if (employeeOrganizations.length > 0) {
      const userRole = await tx.role.findUnique({ where: { name: 'user' } })

      if (!userRole) {
        throw createError({
          statusCode: 500,
          statusMessage: t('error.auth.register'),
        })
      }

      await tx.organizationMember.createMany({
        data: employeeOrganizations.map(({ organizationId }) => ({
          userId: record.userId,
          organizationId,
          roleId: userRole.id,
        })),
        skipDuplicates: true,
      })
    } else {
      const existingMembership = await tx.organizationMember.findFirst({
        where: { userId: record.userId },
        select: { userId: true },
      })

      if (!existingMembership) {
        const ownerRole = await tx.role.findUnique({ where: { name: 'owner' } })

        if (!ownerRole) {
          throw createError({
            statusCode: 500,
            statusMessage: t('error.auth.register'),
          })
        }

        const organization = await tx.organization.create({
          data: {
            name: `${record.user.name}_organization`,
            description: `Description of ${record.user.name}_organization`,
          },
        })

        await tx.organizationMember.create({
          data: {
            userId: record.userId,
            organizationId: organization.id,
            roleId: ownerRole.id,
          },
        })
      }
    }
  })

  return { success: true }
})
