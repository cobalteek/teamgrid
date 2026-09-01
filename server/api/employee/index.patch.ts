import { prisma } from '~~/server/utils/prisma'
import {requireUser} from '~~/server/utils/auth'
import {isValidEmail, isValidName} from '~~/shared/utils/validation'
import type { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
    const {userId} = await requireUser(event)
    const body = await readBody(event)
    const t = await useTranslation(event)
    const {organizationId} = body

    try {
        const owner = await prisma.organizationMember.findUnique({
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

    const canChangeEmployee = owner?.role.name === 'owner'

    if (!canChangeEmployee) {
        throw createError({
            statusCode: 403,
            statusMessage: t('error.user.onlyOwner')
        })
    }
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const surname = typeof body?.surname === 'string' ? body.surname.trim() : ''
    const middlename = typeof body?.middlename === 'string' ? body.middlename.trim() : ''
    const position = body?.position

    if (!name || !surname || !email || !position) {
        throw createError({
            statusCode: 400,
            statusMessage: t('validation.employee.requiredFields')
        });
    }
    if (!isValidEmail(email)) {
          throw createError({statusCode: 400, statusMessage: t('error.auth.invalidEmail')})
    }
    if (!isValidName(name) || !isValidName(surname) || (middlename.length > 0 && !isValidName(middlename))) {
        throw createError({statusCode: 400, statusMessage: t('error.auth.nameLength')})
    }

    const positionConnect =
    body.positionId
      ? { connect: { id: body.positionId } }
      : body.position?.id
        ? { connect: { id: body.position.id } }
        : undefined

    const existsEmail = await prisma.employee.count({
      where: { 
        email,
        id: {
          not: id
        }
      },
    })

    if (existsEmail > 0) {
        throw createError({
            statusCode: 409,
            statusMessage: t('error.auth.emailExist'),
        })
    }

    const updateData = {
      name,
      surname,
      middlename,
      email,
      ...(positionConnect && { position: positionConnect })
    }

    const updatedEmployee = await prisma.employee.update({
        where: {id},
        data: updateData
    })

    return updatedEmployee
    } catch(error) {
        console.log(error)
        throw error
    }
})
