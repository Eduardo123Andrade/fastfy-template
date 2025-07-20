import { FastifyInstance } from 'fastify'
import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie'
import { ENVIRONMENT } from './../config'

export const registerPlugin = (app: FastifyInstance) => {
  // app.use(require('./src/plugin').default)
  app.register(fastifyCookie, {
    secret: ENVIRONMENT.JWT_SECRET, // Chave secreta para assinar cookies (essencial para segurança)
    options: { path: '/' }, // Opções padrão para todos os cookies, se quiser
    // hook: 'onRequest', // Onde os cookies serão anexados ao objeto de solicitação (request) - pode ser 'onRequest' ou 'preHandler' - ver documentação do h'
  } as FastifyCookieOptions)
}
