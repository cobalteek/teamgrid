    import { prisma } from '~~/server/utils/prisma'
    import { defineEventHandler, createError, readBody } from 'h3'
    
    export default defineEventHandler(async (event) => {
      const {userId} = await requireUser(event)
      const t = await useTranslation(event)
      const body = await readBody(event)
      const { shifts, organizationId } = body
    
      if (!Array.isArray(shifts) || shifts.length === 0) {
        throw createError({ statusCode: 400, statusMessage: t('error.bulk.notFound') })
      }
      if (!organizationId) {
        throw createError({ statusCode: 400, statusMessage: t('error.organization.get') })
      }

      const isManager = await isManagerOrganization(userId, organizationId)

      if(!isManager) {
        throw createError({
          statusCode: 403,
          statusMessage: t('error.onlyManager')
        })
      }
      
      for (const shift of shifts) {
        if (!shift.date || !shift.employeeId || !shift.positionId) {
          throw createError({
            statusCode: 400,
            statusMessage: t('validation.shift.requiredFields')
          })
        }
      }
      try {
        const createdShifts = await prisma.$transaction(
          shifts.map(shift => 
            prisma.shift.create({
              data: { ...shift, organizationId },
              include: { employee: true, position: true, organization: true }
            })
          )
        )
        return createdShifts
      } catch (error) {
        console.error(error)
        throw error
      }
    })
