import { UserService } from '@/services'
import { HttpStatusCode } from '@/utils'
import { validateActiveUserSchemaBody } from '@/validations'
import { FastifyReply, FastifyRequest } from 'fastify'

const activeUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { token, email } = validateActiveUserSchemaBody(request.body)
  await UserService.activeUser(email, token)

  return reply.status(HttpStatusCode.OK).send({
    message: 'Usuário ativado com sucesso!',
  })
}

export const UsersController = { activeUser }
