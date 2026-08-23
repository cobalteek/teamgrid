import { prisma } from '../../utils/prisma'
import {
  defineEventHandler,
  createError
} from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslation(event)

  try {
    

  } catch (error) {
    console.error(error)
    throw error
  }
})