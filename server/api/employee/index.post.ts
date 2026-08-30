import { prisma } from '../../utils/prisma'
import {requireUser} from '../../utils/auth'
import {isValidEmail, isValidName} from '../../../shared/utils/validation'
import { EMPLOYEE_COLORS, POSITION_COLORS } from '../../../shared/utils/defaultColors'


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

    const positionsCount = await prisma.position.count({
        where: {
            organizationId
        }
    })

    const colorIndexPosition = Math.min(
        positionsCount,
        POSITION_COLORS.length - 1
    )

    const colorPosition = POSITION_COLORS[colorIndexPosition]

    if(!colorPosition) {
        throw createError({
            statusCode: 409,
            statusMessage: t('error.color.notFound'),
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
            fullName: `fullName_${position}`,
            organizationId: organizationId,
            color: colorPosition
        }
    })

    const employeesCount = await prisma.employee.count({
        where: {
            organizationId
        }
    })

    const colorIndexEmployee = Math.min(
        employeesCount,
        EMPLOYEE_COLORS.length - 1
    )

    const colorEmployee = EMPLOYEE_COLORS[colorIndexEmployee]

    if(!colorEmployee) {
        throw createError({
            statusCode: 409,
            statusMessage: t('error.color.notFound'),
        })
    }

    const employee = await prisma.employee.create({
        data: {
            name,
            surname,
            middlename,
            email,
            positionId: positionRecord.id,
            organizationId: organizationId,
            color: colorEmployee
        }
    })

    return employee
    } catch(error) {
        console.log(error)
        throw error
    }
})
