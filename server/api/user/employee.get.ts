import {prisma} from '../../utils/prisma'
import {
    defineEventHandler,
    createError
} from 'h3'

export default defineEventHandler(async (event) => {
    const t = await useTranslation(event)

    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                surname: true,
                middlename: true,
                position: true,
                email: true
            }
        })

        if (!employees || employees.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: t('error.employee.notFound')
            })
        }

        return employees.map((employee) => ({
            id: employee.id,
            name: employee.name,
            surname: employee.surname,
            middlename: employee.middlename,
            position: employee.position,
            email: employee.email
        }))
    } catch (error) {
        console.log(error)

        throw createError({
            statusCode: 500,
            statusMessage: t('error.employee.get')
        })
    }
})