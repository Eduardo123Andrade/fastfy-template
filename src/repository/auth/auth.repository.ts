import { UnauthorizedException } from '@/exceptions'
import prisma from '@/lib/prisma'

const saveValidToken = async (token: string, userId: string) => {
  const result = await prisma.sessionToken.create({
    data: {
      token,
      userId,
      isValid: true,
    },
  })

  return result
}

const findToken = async (token: string, userId: string) => {
  const _userId = userId || ''
  const result = await prisma.sessionToken.findFirst({
    where: {
      token,
      userId: _userId,
      isValid: true,
    },
  })

  if (!result) throw new UnauthorizedException()

  return result
}

export const AuthRepository = {
  saveValidToken,
  findToken,
}
