import { prisma } from '~~/server/utils/prisma'
import {requireUser} from '~~/server/utils/auth'
import {isValidEmail, isValidName} from '~~/shared/utils/validation'
import {isManagerOrganization} from '~~/server/utils/member'

export default defineEventHandler(async (event) => {
    const {userId} = await requireUser(event)
    const body = await readBody(event)
    const t = await useTranslation(event)
    const {organizationId} = body

    try {
        const isManager = isManagerOrganization(userId, organizationId)

        if (!isManager) {
            throw createError({
                statusCode: 403,
                statusMessage: t('error.user.onlyManager')
            })
        }

        const id = typeof body?.id === 'string' ? body.id.trim() : ''
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
        const name = typeof body?.name === 'string' ? body.name.trim() : ''
        const surname = typeof body?.surname === 'string' ? body.surname.trim() : ''
        const middlename = typeof body?.middlename === 'string' ? body.middlename.trim() : ''

        if (!name || !email) {
            throw createError({
                statusCode: 400,
                statusMessage: t('validation.employee.requiredFields')
            });
        }
        if (!isValidEmail(email)) {
            throw createError({statusCode: 400, statusMessage: t('error.auth.invalidEmail')})
        }
        if (!isValidName(name) || (surname && !isValidName(surname)) || (middlename && !isValidName(middlename))) {
            throw createError({statusCode: 400, statusMessage: t('error.auth.nameLength')})
        }

        const existsEmail = await prisma.employee.findFirst({
            where: { 
                email,
                organizationId,
                id: {
                not: id
                }
            },
        })

        if (existsEmail) {
            throw createError({
                statusCode: 409,
                statusMessage: t('error.auth.emailExistAnEmployee'),
            })
        }

        const user = await prisma.user.findFirst({
            where: {email},
            select: {
                id: true,
                name: true,
                email: true,
                gender: true
            }
        })

        if(user) {
            try {
                const memberOrganization = await prisma.organizationMember.create({
                    data: {
                        userId: user.id,
                        organizationId: organizationId,
                        roleId: 3
                    }
                })
            } catch (error: any) {
                if (error.code === 'P2025') {
                    throw createError({
                        statusCode: 404,
                        statusMessage: 'error.notFound'
                    })
                }
                
                if (error.code === 'P2002') {
                    throw createError({
                        statusCode: 409,
                        statusMessage: 'error.user.alreadyInOrganization'
                    })
                }

                throw error
            }
        }

        const updateData = {
        name,
        surname,
        middlename,
        email
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
