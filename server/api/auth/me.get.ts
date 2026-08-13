import {prisma} from '../../utils/prisma'
import {requireUser} from '../../utils/auth'
import {createError} from 'h3'
import type {Prisma} from "@prisma/client";

export default defineEventHandler(async (event) => {
  const {userId} = await requireUser(event)
  const t = await useTranslation(event)
  type UserWithPositions = Prisma.UserGetPayload<{
    include: {positions: {include: {position: true}}}
  }>

  const user = (await prisma.user.findUnique({
    where: {id: userId},
    include: {positions: {include: {position: true}}}
  })) as UserWithPositions | null

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
    positions: user.positions.map((userPosition) => userPosition.position.name),
  }
})
