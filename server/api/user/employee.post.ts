import { prisma } from '../../utils/prisma'
import {requireUser} from '../../utils/auth'
import {isValidEmail, isValidName} from '../../utils/validation'


export default defineEventHandler(async (event) => {
    const {userId, organizationId} = await requireUser(event)
    const body = await readBody(event)
    const t = await useTranslation(event)

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

    const canCreateEmployee = owner?.role.name === 'owner'

    if (!canCreateEmployee) {
        throw createError({
            statusCode: 403,
            statusMessage: t('error.user.onlyOwner')
        })
    }

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const surname = typeof body?.surname === 'string' ? body.surname.trim() : ''
    const middlename = typeof body?.middlename === 'string' ? body.middlename.trim() : ''
    const position = typeof body?.position === 'string' ? body.position.trim() : ''

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

    const exists = await prisma.employee.findUnique({
        where: { email },
    })

    if (exists) {
        throw createError({
            statusCode: 409,
            statusMessage: t('error.auth.emailExist'),
        })
    }

    const positionRecord = await prisma.position.upsert({
        where: {
            organizationId_name: {
                organizationId: organizationId,
                name: name
            }
        },
        update: {},
        create: {
            name: position,
            organizationId: organizationId
        }
    })

    const employee = await prisma.employee.create({
        data: {
            name,
            surname,
            middlename,
            email,
            positionId: positionRecord.id,
            organizationId: organizationId
        }
    })

    return employee
})
