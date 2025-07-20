import { HealthCheckController } from '@/controllers'
import { FastifyInstance } from 'fastify'

export const healthCheckRouter = async (app: FastifyInstance) => {
  app.get('/healthCheck', HealthCheckController.check)
}
