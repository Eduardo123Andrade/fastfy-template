import { ENVIRONMENT } from '@/config'
import { AuthService, UserService } from '@/services'
import { HttpStatusCode } from '@/utils'
import { validateCreateUserSchemaBody, validateLoginUserSchemaBody, validateResendActivationTokenSchemaBody } from '@/validations'
import { TokenView, UserView } from '@/view'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const signUp = async (request: FastifyRequest, reply: FastifyReply) => {
  const userData = validateCreateUserSchemaBody(request.body)

  const result = await UserService.create(userData)
  const user = UserView.createUserView(result)

  return reply.status(HttpStatusCode.CREATED).send({ user })
}

const login = async (request: FastifyRequest, reply: FastifyReply, app: FastifyInstance) => {
  const { email, password } = validateLoginUserSchemaBody(request.body)

  const foundedUser = await UserService.login(email, password)

  const payload = AuthService.generatePayload(foundedUser.id)
  const _token = app.jwt.sign(payload, { sub: foundedUser.id })

  const sessionToken = await AuthService.createToken(_token, foundedUser.id)

  const user = UserView.createUserView(foundedUser)
  const token = TokenView.cleanToken(sessionToken)

  reply.setCookie('auth_token', token, {
    path: '/',
    httpOnly: true,
    secure: ENVIRONMENT.IS_PRODUCTION,
    sameSite: 'lax',
    signed: true,
    maxAge: 60 * 60 * 1000, // 1 hora em milissegundos (tempo de vida do cookie)
  })

  return reply.status(HttpStatusCode.OK).send({
    user,
  })
}

const resendActiveToken = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = validateResendActivationTokenSchemaBody(request.body)

  await AuthService.resendActivationToken(email)

  return reply.status(HttpStatusCode.OK).send()
}
const validateToken = async (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(HttpStatusCode.OK).send()
}

export const AuthController = { login, signUp, resendActiveToken, validateToken }
