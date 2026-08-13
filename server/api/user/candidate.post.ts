import { prisma } from '../../utils/prisma'
import {requireUser} from '../../utils/auth'
import {isValidEmail, isValidName} from '../../utils/validation'


export default defineEventHandler(async (event) => {
    const {userId} = await requireUser(event)
    const body = await readBody(event)
    const t = await useTranslation(event)

    const admin = await prisma.user.findUnique({
        where: {id: userId},
        select: {
            positions: {
                include: {
                    position: true
                }
            }
        }
    })

    console.log('USER ID:', userId)
    console.log('ADMIN:', JSON.stringify(admin, null, 2))

    const canCreateCandidate = admin?.positions.some((userPosition) =>
        ['admin', 'owner'].includes(userPosition.position.name)
    )

    if (!canCreateCandidate) {
        throw createError({
            statusCode: 403,
            statusMessage: t('error.user.onlyAdmin')
        })
    }

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const surname = typeof body?.surname === 'string' ? body.surname.trim() : ''
    const middlename = typeof body?.middlename === 'string' ? body.middlename.trim() : ''
    const position = typeof body?.position === 'string' ? body.position.trim() : ''

    if (!name || !surname || !middlename || !email || !position) {
        throw createError({
            statusCode: 400,
            statusMessage: t('validation.candidate')
        });
    }
    if (!isValidEmail(email)) {
          throw createError({statusCode: 400, statusMessage: t('error.auth.invalidEmail')})
    }
    if (!isValidName(name) || !isValidName(surname) || !isValidName(middlename)) {
        throw createError({statusCode: 400, statusMessage: t('error.auth.nameLength')})
    }

    const exists = await prisma.candidate.findUnique({
        where: { email },
    })

    if (exists) {
        throw createError({
            statusCode: 409,
            statusMessage: t('error.auth.emailExist'),
        })
    }

    const candidate = await prisma.candidate.create({
        data: {
            name,
            surname,
            middlename,
            email,
            position
        }
    })

    return candidate
})
