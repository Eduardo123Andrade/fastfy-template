import { BadRequestException } from '@/exceptions'
import { isOlder } from './../../utils/validate-age'
import { CreateUserDto, UserDto } from '@/interfaces'
import { ActiveUserRepository, UserRepository } from '@/repository'
import { encoder, isActiveTokenExpired } from '@/utils'
import { sendActivationEmail } from '../user-email.service'

const create = async (data: CreateUserDto): Promise<UserDto> => {
  const isOlderAge = isOlder(data.birthdate)

  if (!isOlderAge) {
    throw new BadRequestException('Você precisa ter mais de 18 anos para se cadastrar')
  }

  const hashedPassword = await encoder.codify(data.password)

  const userToSave = {
    ...data,
    password: hashedPassword,
  }

  const { token, user } = await UserRepository.create(userToSave)

  await sendActivationEmail({
    token: token.token,
    userEmail: user.email,
    userName: user.name,
  })

  return user
}

const activeUser = async (email: string, token: string): Promise<UserDto> => {
  const user = await UserRepository.findByEmail(email)

  const tokenResponse = await ActiveUserRepository.findUserToken(token, user.id)

  if (isActiveTokenExpired(tokenResponse.createdAt)) throw new BadRequestException('Token expirado')

  const result = await UserRepository.activeUser(user.cpf, token)

  return result
}

const login = async (email: string, password: string): Promise<UserDto> => {
  const user = await UserRepository.findByEmail(email)

  const isPasswordValid = await encoder.verifyPassword(password, user.password)

  if (!isPasswordValid) throw new BadRequestException('Senha inválida')

  if (user.status.description !== 'ACTIVE') {
    throw new BadRequestException('Usuário inativo')
  }

  return user
}

export const UserService = {
  create,
  activeUser,
  login,
}
