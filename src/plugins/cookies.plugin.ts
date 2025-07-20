import { FastifyInstance } from 'fastify'
import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie'
import { ENVIRONMENT } from '@/config'

export const cookiesRegister = (app: FastifyInstance) => {
  app.register(fastifyCookie, {
    secret: ENVIRONMENT.JWT_SECRET,
    options: { path: '/' },
  } as FastifyCookieOptions)
}
