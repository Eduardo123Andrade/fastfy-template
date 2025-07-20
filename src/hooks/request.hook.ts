import { UnauthorizedException } from '@/exceptions'
import { AuthService } from '@/services'
import { formatSignToken, HttpStatusCode, isActiveTokenExpired, validateTokenCookie } from '@/utils'
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'

const verifyUserToken = async (request: FastifyRequest, done: HookHandlerDoneFunction) => {
  const token = request.cookies.auth_token || ''

  const isValid = validateTokenCookie(token)

  if (!isValid) throw new UnauthorizedException()

  const jwtToken = formatSignToken(token)

  const payload = JSON.parse(atob(token.split('.')[1]))

  if (!payload || isActiveTokenExpired(payload.exp)) throw new UnauthorizedException()

  const userId = payload.userId || null

  await AuthService.validateToken(jwtToken, userId)

  done()
}

export const onRequestHook = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
  const path = request.url

  if (path !== '/auth/validate-token' && (path.includes('/auth') || path === '/users/active-user')) {
    return done()
  }

  request
    .jwtVerify()
    .then(() => verifyUserToken(request, done))
    .catch((err) => {
      console.log(err)
      reply.status(HttpStatusCode.UNAUTHORIZED).send({ message: 'Seu acesso expirou. Faça login e tente novamente' })
    })
}
