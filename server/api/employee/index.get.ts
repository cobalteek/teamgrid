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
    const organizationId = query.organizationId ? Number(query.organizationId) : undefined
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
                    fullName: employee.position.fullName,
                    organizationId: employee.position.organizationId
                },
                organizationId: employee.organizationId,
                email: employee.email
            }
        }

        const employees = await prisma.employee.findMany({
            where: {
                organizationId
            },
            select: selectFields
        })

        if (!employees) {
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

    } catch (error) {
        console.error(error)

        throw error
    }
})
