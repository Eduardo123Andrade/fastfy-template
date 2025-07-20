import { ENVIRONMENT } from '@/config'
import fastifyJwt from '@fastify/jwt'
import { FastifyInstance } from 'fastify'

export const jwtPlugin = async (app: FastifyInstance) => {
  await app.register(fastifyJwt, {
    secret: ENVIRONMENT.JWT_SECRET,
  })
}
