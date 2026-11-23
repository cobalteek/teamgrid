import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { isValidEmail, isValidName } from '~~/shared/utils/validation'
import { requireOrganizationRole } from '~~/server/utils/member'
import { parseSalaryConfig } from '~~/server/utils/salary'

export default defineEventHandler(async (event) => {
  const { userId } = await requireUser(event)
  const body = await readBody(event)
  const t = await useTranslation(event)
  const { organizationId } = body

  try {
    await requireOrganizationRole(
      userId,
      organizationId,
      ['owner', 'admin'],
      t('error.user.onlyManager'),
    )

    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const surname = typeof body?.surname === 'string' ? body.surname.trim() : ''
    const middlename = typeof body?.middlename === 'string' ? body.middlename.trim() : ''
    const salary = parseSalaryConfig(body, t('error.salary.invalid'), { preserveNone: true })
    const positionId = typeof body?.positionId === 'number' ? body.positionId : -1
    console.log(positionId)
    if (!name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: t('validation.employee.requiredFields'),
      })
    }
    if (!isValidEmail(email)) {
      throw createError({ statusCode: 400, statusMessage: t('error.auth.invalidEmail') })
    }
    if (
      !isValidName(name) ||
      (surname && !isValidName(surname)) ||
      (middlename && !isValidName(middlename))
    ) {
      throw createError({ statusCode: 400, statusMessage: t('error.auth.nameLength') })
    }

    if(positionId === -1) {
      throw createError({
        statusCode: 400,
        statusMessage: t('error.position.notFound'),
      })
    }

    const existsEmail = await prisma.employee.findFirst({
      where: {
        email,
        organizationId,
        id: {
          not: id,
        },
      },
    })

    if (existsEmail) {
      throw createError({
        statusCode: 409,
        statusMessage: t('error.auth.emailExistAnEmployee'),
      })
    }

    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        emailVerifiedAt: true,
      },
    })

    if (user) {
      if (!user.emailVerifiedAt) {
        throw createError({
          statusCode: 403,
          statusMessage: t('error.auth.emailNotVerified'),
        })
      }

      const userRole = await prisma.role.findUnique({
        where: { name: 'user' },
        select: { id: true },
      })

      if (!userRole) {
        throw createError({
          statusCode: 500,
          statusMessage: 'error.role.notFound',
        })
      }

      await prisma.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          organizationId,
          roleId: userRole.id,
        },
      })
    }

    const position = await prisma.position.findUnique({
        where: {
          id: positionId,
          organizationId,
        },
      })

      if (!position) {
      throw createError({
        statusCode: 404,
        statusMessage: 'error.position.notFound',
      })
    }

    const updateData = {
      name,
      surname,
      middlename,
      email,
      position: { connect: { id: position.id } },
      ...salary,
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id, organizationId },
      data: updateData,
    })

    return updatedEmployee
  } catch (error) {
    console.log(error)
    throw error
  }
})
