import { FastifyInstance } from 'fastify'
import { UsersController } from '../controllers'

export const usersRouter = async (app: FastifyInstance) => {
  app.patch('/users/active-user', UsersController.activeUser)
  app.get('/users/test', (req, res) => {
    return res.status(200).send({
      userId: req.user.sub,
    })
  })
}
