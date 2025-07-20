import { NotFoundException } from '@/exceptions'
import prisma from '@/lib/prisma'
import { generateRandomNumber } from '@/utils'
import { UserRepository } from './user.repository'

const createActiveUserToken = async (id: string) => {
  const user = await UserRepository.findById(id)

  const token = generateRandomNumber(6)

  const parseToken = `${token}`.padStart(6, '0')

  const createdToken = await prisma.activeUserToken.create({
    data: {
      token: parseToken,
      userId: user.id,
    },
  })

  return createdToken
}

const existsToken = async (token: string, userId: string): Promise<boolean> => {
  const result = await prisma.activeUserToken.findFirst({
    where: {
      token,
      userId,
    },
  })

  if (!result) throw new NotFoundException('Token not found')

  return true
}

const findUserToken = async (token: string, userId: string) => {
  const result = await prisma.activeUserToken.findFirst({
    where: {
      token,
      userId,
    },
  })

  if (!result) throw new NotFoundException('Token not found')

  return result
}

export const ActiveUserRepository = {
  createActiveUserToken,
  existsToken,
  findUserToken,
}
