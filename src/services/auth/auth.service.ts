import { ENVIRONMENT } from '@/config'
import { ActiveUserRepository, AuthRepository, UserRepository } from '@/repository'
import { sendActivationEmail } from '../user-email.service'
import { UserStatus } from '@/utils'
import { BadRequestException } from '@/exceptions'

const generatePayload = (userId: string, expires = ENVIRONMENT.JWT_ACCESS_EXPIRATION_DAYS) => {
  const dateToExpires = new Date()
  dateToExpires.setDate(dateToExpires.getDate() + expires)

  const payload = {
    userId,
    iat: Date.now(),
    exp: dateToExpires.getTime(),
  }

  return payload
}

const createToken = async (token: string, userId: string) => {
  const result = await AuthRepository.saveValidToken(token, userId)
  return result
}

const validateToken = async (token: string, userId: string) => {
  const result = await AuthRepository.findToken(token, userId)

  return result
}

const resendActivationToken = async (email: string) => {
  const user = await UserRepository.findByEmail(email)

  if (user.status.description === UserStatus.ACTIVE) throw new BadRequestException('Usuário já está ativo')

  const token = await ActiveUserRepository.createActiveUserToken(user.id)

  await sendActivationEmail({
    token: token.token,
    userEmail: user.email,
    userName: user.name,
  })
}

export const AuthService = {
  generatePayload,
  createToken,
  validateToken,
  resendActivationToken,
}
