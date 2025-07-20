import { healthCheckService } from '@/services'
import { HttpStatusCode } from '@/utils'
import { FastifyReply, FastifyRequest } from 'fastify'

const check = async (request: FastifyRequest, reply: FastifyReply) => {
  const result = await healthCheckService.check()

  return reply.status(HttpStatusCode.OK).send(result)
}

export const HealthCheckController = { check }
