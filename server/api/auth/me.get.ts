import {prisma} from '~~/server/utils/prisma'
import {requireUser} from '~~/server/utils/auth'
import {createError} from 'h3'
import type {Prisma} from "@prisma/client";

export default defineEventHandler(async (event) => {
  const {userId} = await requireUser(event)
  const t = await useTranslation(event)
  type UserMembreship = Prisma.UserGetPayload<{
    include: {memberships: {include: {user: true, organization: true}}}
  }>

  const user = (await prisma.user.findUnique({
    where: {id: userId},
    include: {memberships: {include: {user: true, organization: true}}}
  })) as UserMembreship | null

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: t('error.auth.unAuth')
    })
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    gender: user.gender,
  }
})
