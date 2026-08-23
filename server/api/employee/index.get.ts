import { prisma } from '../../utils/prisma'
import {
    defineEventHandler,
    createError,
    getQuery
} from 'h3'

export default defineEventHandler(async (event) => {
    const t = await useTranslation(event)
    const query = getQuery(event)
    const employeeId = query.employeeId ? String(query.employeeId) : undefined

    try {
        const selectFields = {
            id: true,
            name: true,
            surname: true,
            middlename: true,
            position: true,
            email: true,
            organizationId: true
        }

        if (employeeId) {
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: selectFields
            })

            if (!employee) {
                throw createError({
                    statusCode: 404,
                    statusMessage: t('error.employee.notFound')
                })
            }

            return {
                id: employee.id,
                name: employee.name,
                surname: employee.surname,
                middlename: employee.middlename,
                position: {
                    id: employee.position.id,
                    name: employee.position.name,
                    organizationId: employee.position.organizationId
                },
                organizationId: employee.organizationId,
                email: employee.email
            }
        }

        const employees = await prisma.employee.findMany({
            select: selectFields
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
            position: {
                id: employee.position.id,
                name: employee.position.name,
                organizationId: employee.position.organizationId
            },
            organizationId: employee.organizationId,
            email: employee.email
        }))

    } catch (error: any) {
        console.error(error)

        throw error
    }
})
