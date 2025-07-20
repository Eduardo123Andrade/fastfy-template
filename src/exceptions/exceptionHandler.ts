import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { HttpStatusCode } from '@/utils'
import { Exception } from './Exception.exception'

type LocalError = PrismaClientKnownRequestError | ZodError | Exception

export const errorHandler = (error: LocalError | ZodError, _: FastifyRequest, reply: FastifyReply) => {
  if (error instanceof Exception) {
    return reply.status(error.getHttpStatus()).send({
      message: error.message,
      errors: error.getErrors(),
    })
  }

  console.log(error)
  return reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({ message: 'Erro desconhecido' })
}
