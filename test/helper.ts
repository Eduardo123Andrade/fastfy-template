import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import { errorHandler } from '../src/exceptions/exceptionHandler'
import { registerRouter } from '../src/routes'

// Função auxiliar para construir a aplicação para testes
export async function build(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false // Desabilitar logs durante testes
  })
  
  // Registrar plugins
  await app.register(cors)
  app.setErrorHandler(errorHandler)
  
  // Registrar rotas
  await app.register(registerRouter)
  
  return app
}