import { FastifyInstance } from 'fastify'
import { AuthController } from '@/controllers'

export const authRouter = async (app: FastifyInstance) => {
  app.post('/auth/sign-in', (req, res) => AuthController.login(req, res, app))
  app.post('/auth/sign-up', AuthController.signUp)
  app.post('/auth/resend-activation-token', AuthController.resendActiveToken)
  app.get('/auth/validate-token', AuthController.validateToken)
}
