    import { prisma } from '~~/server/utils/prisma'
    import { defineEventHandler, createError, readBody } from 'h3'
    
    export default defineEventHandler(async (event) => {
      const t = await useTranslation(event)
      const body = await readBody(event)
      const { shifts, organizationId } = body
    
      if (!Array.isArray(shifts) || shifts.length === 0) {
        throw createError({ statusCode: 400, statusMessage: t('error.bulk.notFound') })
      }
      if (!organizationId) {
        throw createError({ statusCode: 400, statusMessage: t('error.organization.get') })
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
