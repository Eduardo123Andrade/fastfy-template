import { ConflictException, NotFoundException } from '@/exceptions'
import { CreateUserDto, UserDto } from '@/interfaces'
import prisma from '@/lib/prisma'
import { UserStatus } from '@/utils'
import { UserStatusRepository } from './user-status.repository'
import { UserStatus as IUserStatus } from '@/types'
import { ActiveUserRepository } from './active-user.repository'

const parseData = (data: any) => {
  const { status, ...user } = data

  return {
    ...user,
    status: status.description as IUserStatus,
  }
}

const create = async (data: CreateUserDto) => {
  const { confirmPassword, ...userData } = data

  const status = await UserStatusRepository.getStatusByDescription(UserStatus.INACTIVE)

  const userDataToSave = {
    ...userData,
    statusId: status.id,
  }

  try {
    const user = await prisma.user.create({ data: userDataToSave })

    const token = await ActiveUserRepository.createActiveUserToken(user.id)

    return {
      user: {
        ...user,
        status,
      },
      token,
    }
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictException('User already exists')
    throw error
  }
}
const findById = async (id: string): Promise<UserDto> => {
  const result = await prisma.user.findUnique({ where: { id }, include: { status: true } })

  if (!result) throw new NotFoundException('Usuario não econtrado')

  return parseData(result)
}

const findByCpf = async (cpf: string): Promise<UserDto> => {
  const result = await prisma.user.findUnique({ where: { cpf }, include: { status: true } })

  if (!result) throw new NotFoundException('Usuario não econtrado')

  return parseData(result)
}

const activeUser = async (cpf: string, token: string): Promise<UserDto> => {
  const user = await findByCpf(cpf)

  await ActiveUserRepository.existsToken(token, user.id)

  const status = await UserStatusRepository.getStatusByDescription(UserStatus.ACTIVE)

  const result = await prisma.user.update({
    where: { id: user.id },
    data: {
      statusId: status.id,
    },
    include: {
      status: true,
    },
  })

  return result
}

const findByEmail = async (email: string): Promise<UserDto> => {
  const result = await prisma.user.findUnique({ where: { email }, include: { status: true } })

  if (!result) throw new NotFoundException('Usuario não econtrado')

  return result
}

export const UserRepository = {
  activeUser,
  create,
  findByEmail,
  findById,
  findByCpf,
}
